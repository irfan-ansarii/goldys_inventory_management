import { createAdjustments } from "@/drizzle/services/adjustments";
import { getTransactions } from "@/drizzle/services/orders";
import { getInventories, updateInventory } from "@/drizzle/services/products";
import { getPurchaseTransactions } from "@/drizzle/services/purchase";
import { zValidator } from "@hono/zod-validator";
import { endOfDay, startOfDay, subDays, subMonths } from "date-fns";
import type { ValidationTargets } from "hono";
import jsPDF from "jspdf";
import type { ZodSchema } from "zod";

interface SanitizeProps {
  [key: string]: any;
}

export const DELETE_ROLES = ["super", "admin"];

export const validator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const { success, error } = result;
      return c.json(
        {
          success,
          message: "Validation failed",
          error,
        },
        400
      );
    }
  });
};

export const INTERVAL_MAP = {
  today: {
    start: startOfDay(new Date()),
    interval: "30 MINUTE",
    end: endOfDay(new Date()),
  },
  yesterday: {
    start: startOfDay(subDays(new Date(), 1)),
    interval: "30 MINUTE",
    end: endOfDay(subDays(new Date(), 1)),
  },
  "7days": {
    start: startOfDay(subDays(new Date(), 6)),
    interval: "1 day",
    end: endOfDay(new Date()),
  },
  "30days": {
    start: startOfDay(subDays(new Date(), 29)),
    interval: "1 day",
    end: endOfDay(new Date()),
  },
  "90days": {
    start: startOfDay(subDays(new Date(), 90)),
    interval: "1 day",
    end: endOfDay(new Date()),
  },
  "12month": {
    start: startOfDay(subMonths(new Date(), 11)),
    interval: "30 days",
    end: endOfDay(new Date()),
  },
};
export type IntervalKey = keyof typeof INTERVAL_MAP;
export const PAGE_LIMIT = 20;

export const sanitizeOutput = <T extends SanitizeProps>(
  data: T | T[],
  fieldsToExclude: (keyof T)[]
): T extends any[] ? T[] : T => {
  const sanitizeObject = (obj: T, fields: (keyof T)[]): T => {
    const sanitizedObj = { ...obj };
    for (const field of fields) {
      delete sanitizedObj[field];
    }
    return sanitizedObj;
  };

  if (Array.isArray(data)) {
    return data.map((item) =>
      sanitizeObject(item, fieldsToExclude)
    ) as T extends any[] ? T[] : T;
  } else {
    return sanitizeObject(data, fieldsToExclude) as T extends any[] ? T[] : T;
  }
};

export const formatValue = (
  value: string | number,
  decimal?: number
): number => {
  let numericValue: number;

  if (typeof value === "string") {
    numericValue = parseFloat(value);
  } else if (typeof value === "number") {
    numericValue = value;
  } else {
    throw new Error("Invalid value: value must be a string or number");
  }

  return parseFloat(numericValue.toFixed(decimal || 2));
};

// get order status
export const getOrderStatus = async (orderId: number, orderTotal: number) => {
  const transactions = await getTransactions(orderId);

  let totalPaid = 0;
  let totalRefund = 0;
  let totalVoid = 0;

  // Step 3: Calculate total sale and total refund amount
  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.amount!);
    if (transaction.kind === "sale") {
      totalPaid += amount;
    } else if (transaction.kind === "refund") {
      totalRefund += amount;
    } else if (transaction.kind === "void") {
      totalVoid += amount;
    }
  });

  const due = orderTotal - (totalPaid - totalRefund);

  let paymentStatus = "unpaid";

  if (due === 0 && orderTotal === 0) {
    paymentStatus = "refunded";
  } else if (due === 0) {
    paymentStatus = "paid";
  } else if (due > 0 && due < orderTotal) {
    paymentStatus = "partially paid";
  } else if (Math.abs(due) > orderTotal) {
    paymentStatus = "overpaid";
  } else if (orderTotal === 0 && totalVoid > 0) {
    paymentStatus = "voided";
  }

  return {
    paymentStatus,
    due,
  };
};

// get purchase  status
export const getPurchaseStatus = async (
  purchaseId: number,
  purchaseTotal: number
) => {
  const transactions = await getPurchaseTransactions(purchaseId);

  let totalPaid = 0;
  let totalRefund = 0;
  let totalVoid = 0;

  // Step 3: Calculate total paid and total refund amount
  transactions.forEach((transaction) => {
    const amount = parseFloat(transaction.amount!);
    if (transaction.kind === "paid") {
      totalPaid += amount;
    } else if (transaction.kind === "refund") {
      totalRefund += amount;
    } else if (transaction.kind === "void") {
      totalVoid += amount;
    }
  });

  const due = purchaseTotal - (totalPaid - totalRefund);

  let paymentStatus = "unpaid";

  if (due === 0 && purchaseTotal === 0) {
    paymentStatus = "refunded";
  } else if (due === 0) {
    paymentStatus = "paid";
  } else if (due > 0 && due < purchaseTotal) {
    paymentStatus = "partially paid";
  } else if (Math.abs(due) > purchaseTotal) {
    paymentStatus = "overpaid";
  } else if (purchaseTotal === 0 && totalVoid > 0) {
    paymentStatus = "voided";
  }

  return {
    paymentStatus,
    due,
  };
};

// create adjustment and update stock
export const updateStock = async (
  storeId: number,
  items: Record<string, any>[]
) => {
  if (!items || items.length === 0 || !storeId) return;

  const filtered = items.filter(
    (item) => item.quantity !== 0 && item.variantId
  );

  if (filtered.length === 0) return;

  const createdItems = await createAdjustments(filtered);

  const variantIds = createdItems.map((item) => item.variantId);

  const { data: inventories } = await getInventories({
    storeId,
    variantIds,
    limit: 500,
  });

  // update stock
  const updateInventories = inventories.map((inv) => {
    const created = createdItems.find(
      (item) => item.variantId === inv.variantId
    );
    return updateInventory(inv.id, {
      stock: (inv.stock || 0) + created?.quantity!,
    });
  });

  await Promise.all(updateInventories);
  return createdItems;
};

interface TextOptions {
  width?: number;
  align?: string;
  style?: string;
  weight?: string;
  size?: number;
  color?: string;
  baseline?:
    | "bottom"
    | "alphabetic"
    | "ideographic"
    | "top"
    | "middle"
    | "hanging";
  url?: string;
  underline?: boolean;
}

interface FontProps {
  weight: string;
  size: number;
  color: string;
  style: string;
}
const bodyColor = "#000000";
/**
 * set font, font-weight, font-style and font-size
 */
export function setPdfFont(doc: jsPDF, options: FontProps) {
  const { weight, size, color, style } = options;
  doc.setFont("helvetica", style, weight);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

/**
 * draw text
 */
export function drawPdfText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: TextOptions
) {
  const {
    width = 128,
    align = "left",
    style = "normal",
    weight = "normal",
    size = 8,
    color = bodyColor,
    baseline = "bottom",
    ...rest
  } = options;

  setPdfFont(doc, { weight, size, color, style });

  const { w, h } = doc.getTextDimensions(text);
  if (align === "center") {
    x = x + width / 2 - w / 2;
  }

  if (align === "right") {
    x = x + width - w;
  }

  const finalText = truncatePdfText(text, width, w);
  doc.text(finalText, x, y + h, { baseline, ...rest });
}

/**
 * helper function to trim the title
 * @param text
 * @param width
 * @param actualWidth
 * @returns
 */
export function truncatePdfText(
  text: string,
  width: number,
  actualWidth: number
) {
  const ellipsis = "...";
  let truncatedText = text;

  if (actualWidth > width) {
    const ratio = width / actualWidth;
    const truncatedLength = Math.floor(text.length * ratio) - ellipsis.length;
    truncatedText = text.substring(0, truncatedLength) + ellipsis;
  }

  return truncatedText;
}
