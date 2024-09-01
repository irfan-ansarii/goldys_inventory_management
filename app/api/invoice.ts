"use server";

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { getStore } from "@/drizzle/services/stores";
import { getOption } from "@/drizzle/services/options";
import { StoreType } from "@/query/stores";
import { drawPdfText } from "./utils";
import { OrderType } from "@/query/orders";
import { formatNumber } from "@/lib/utils";

const lineColor = "#D7DAE0";
const headingColor = "#141414";

interface StoreTypeProps extends Omit<StoreType, "address"> {
  address: { [k: string]: string };
}

interface ConfigTypes {
  logo: string;
  company: string;
  phone: string;
  email: string;
  doc: jsPDF;
  header: string[];
  footer: string[];
  conditions: string[];
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}
type LineItem = OrderType["lineItems"][0];

let config: ConfigTypes;

/**
 * initialize gloabal config
 * @param storeId
 */
const initialize = async (storeId: number) => {
  const {
    company,
    phone,
    email,
    logo,
    address: storeAddress,
    gstin,
  } = (await getStore(storeId)) as StoreTypeProps;

  const { value } = await getOption("invoice", storeId);

  const { address, city, state, pincode } = storeAddress;

  const json = JSON.parse(value);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [148, 210],
  });

  config = {
    company,
    phone,
    email,
    logo,
    header: [company, address, city, `${state} ${pincode}`, `GSTIN: ${gstin}`],
    footer: json.footer.map((text: string) => text),
    conditions: json.conditions,
    width: 148,
    height: 210,
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    doc,
  };

  return config;
};

/**
 * Draw header
 */
async function drawHeader() {
  const { width, top, right, left, doc, logo, company } = config;

  const response = await fetch(logo);

  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();

    doc.addImage(new Uint8Array(arrayBuffer), left, top, 50, 12);
  }

  doc.setDrawColor(lineColor);

  drawPdfText(doc, "TAX INVOICE", left, top, {
    width: width - (left + right),
    weight: "bold",
    align: "right",
    size: 15,
    color: headingColor,
  });

  doc.line(left, 30, width - right, 30);
}

/**
 * Draw company details
 */
function drawCompanyDetails() {
  const { left, header, doc } = config;

  drawPdfText(doc, "From:", left, 35, {
    weight: "bold",
    color: headingColor,
  });

  let y = 40;
  header.forEach((address) => {
    drawPdfText(doc, address, left, y, {});
    y += 3.5;
  });
}

/**
 * draw customer details
 * @param billing[]
 */
function drawCustomerDetails(billing: string[]) {
  const { left, right, width, doc } = config;
  const x = (38 / 100) * (width - (left + right));

  drawPdfText(doc, "Billed To:", x, 35, {
    weight: "bold",
    color: headingColor,
  });

  let y = 40;

  for (const address of billing) {
    if (typeof address === "string" && address.length > 0) {
      drawPdfText(doc, address, x, y, {});
      y += 3.5;
    }
  }
}

/**
 * Draw order details
 * @param order
 */
function drawOrderDetails(order: { name: string; date: string }) {
  const { left, width, right, doc } = config;
  const { name, date } = order;
  const x = (38 / 100) * (width - (left + right)) * 2;

  drawPdfText(doc, "Invoice Number:", x, 35, {
    weight: "bold",
    color: headingColor,
  });

  drawPdfText(doc, name, x, 39, {});

  drawPdfText(doc, "Invoice Date:", x, 45, {
    weight: "bold",
    color: headingColor,
  });

  drawPdfText(doc, format(date, "dd-MM-yyyy hh:mm:ss a"), x, 49, {});
  doc.line(left, 65, width - right, 65);
}

/**
 * draw footer
 */
async function drawFooter() {
  const { width, height, right, bottom, left, conditions, footer, doc } =
    config;
  const y = height - (bottom + 4);

  doc.line(left, 155, width - right, 155);
  doc.line(left, height - (bottom + 8), width - right, height - (bottom + 8));

  let x = left;

  drawPdfText(doc, "Terms and Conditions:", left, 160, {
    color: headingColor,
    weight: "bold",
  });

  let yPos = 165;
  conditions.forEach((cond) => {
    drawPdfText(doc, cond, left, yPos, {});
    yPos += 3.5;
  });

  x = left;

  const totalWidth = footer.reduce((acc, curr) => {
    const { w } = doc.getTextDimensions(curr);
    return (acc += w);
  }, 0);

  const space = (width - left - right - totalWidth) / (footer.length - 1);

  footer.forEach((item) => {
    const { w } = doc.getTextDimensions(item);
    drawPdfText(doc, item, x, y, {});

    x += w + space;
  });
}

/**
 * Draw table header
 */
function drawTableHeader() {
  const { width, right, left, doc } = config;
  let x = left;

  const colWitdh = ((60 / 100) * (width - (left + right))) / 5;

  const columns = [
    { text: "S.NO.", width: 10 },
    { text: "DESCRIPTION", width: (40 / 100) * (width - (left + right)) - 10 },
    { text: "HSN CODE", width: colWitdh, align: "right" },
    { text: "PRICE", width: colWitdh, align: "right" },
    { text: "QUANTITY", width: colWitdh, align: "right" },
    { text: "TAX", width: colWitdh, align: "right" },
    { text: "TOTAL", width: colWitdh, align: "right" },
  ];

  columns.forEach(({ text, width, align }) => {
    drawPdfText(doc, text, x, 68, {
      width: width,
      color: headingColor,
      weight: "bold",
      align,
    });

    x += width;
  });
  doc.line(left, 75, width - right, 75);
}

/**
 * create template
 */
async function createTemplate(page = 1, order: OrderType) {
  const { doc } = config;
  const { name, billing, createdAt } = order;
  doc.setPage(page);

  await drawHeader();

  drawCompanyDetails();

  drawCustomerDetails(billing!);

  drawOrderDetails({ name, date: createdAt! });

  drawTableHeader();

  await drawFooter();
}

/**
 * draw table rows
 * @param rows
 */
function drawTableRow<
  T extends {
    text: string;
    subtext?: string;
    width: number;
    align: string;
    color: string;
  }[]
>(rows: T[]): T[] {
  const { width, left, right, doc } = config;

  rows.forEach((columns, i) => {
    let y = 75 + i * 10;
    let x = left;

    columns.forEach(({ text, subtext, width, align, color }) => {
      drawPdfText(doc, text, x, y + 2, {
        width: width,
        align,
        color,
      });
      if (subtext) {
        drawPdfText(doc, subtext, x, y + 5.5, {
          width: width,
          align,
          size: 6,
        });
      }

      doc.line(left, y, width - right, y);
      x += width;
    });
  });

  return rows;
}

/**
 * draw order total
 * @param order
 */
function drawTableTotal(order: OrderType) {
  const { width, right, left, doc } = config;

  const { subtotal, discount, total, due, taxLines = [] } = order;
  let y = 161;

  const totals = [
    [{ text: "SUBTOTAL" }, { text: formatNumber(subtotal), align: "right" }],
  ];

  if (parseFloat(discount) > 0) {
    totals.push([
      { text: "DISCOUNT" },
      { text: `-${formatNumber(discount)}`, align: "right" },
    ]);
  }

  taxLines?.forEach((tax: { name: string; amount: string }) => {
    totals.push([
      { text: tax.name },
      { text: formatNumber(tax.amount), align: "right" },
    ]);
  });

  totals.forEach((row) => {
    let x = width - left - 50;

    row.forEach(({ text, align }) => {
      drawPdfText(doc, text, x, y - 4.5, {
        align,
        width: 25,
        color: headingColor,
      });

      x += 25;
    });

    doc.line(width - left - 50, y, width - right, y);
    y += 6;
  });

  doc.line(width - left - 50, y - 6, width - right, y - 6);

  drawPdfText(doc, "TOTAL", width - left - 50, y - 3.5, {
    width: 25,
    color: headingColor,
    weight: "bold",
  });

  drawPdfText(doc, formatNumber(total), width - left - 25, y - 3.5, {
    width: 25,
    color: headingColor,
    weight: "bold",
    align: "right",
  });

  doc.line(width - left - 50, y + 2, width - right, y + 2);

  y += 8;

  if (parseFloat(due) !== 0) {
    drawPdfText(doc, "DUE", width - left - 50, y - 3.5, {
      width: 25,
      color: headingColor,
      weight: "bold",
    });

    drawPdfText(doc, formatNumber(due), width - left - 25, y - 3.5, {
      width: 25,
      color: headingColor,
      weight: "bold",
      align: "right",
    });

    doc.line(width - left - 50, y + 2, width - right, y + 2);
  }
}

/**
 * generate row data
 * @param lineItems
 * @returns
 */
const generateRowData = (lineItems: LineItem[]) => {
  const { width, left, right } = config;
  const colWitdh = ((60 / 100) * (width - (left + right))) / 5;

  return lineItems.map((item, i) => [
    {
      text: `${i + 1}`,
      width: 10,
      align: "left",
    },
    {
      text: item.title!,
      subtext:
        item.variantTitle?.toLocaleLowerCase() !== "default"
          ? item.variantTitle
          : "",
      width: (40 / 100) * (width - (left + right)) - 10,
      color: headingColor,
      align: "left",
    },
    {
      text: item.hsn,
      width: colWitdh,
      align: "right",
    },
    {
      text: formatNumber(item.salePrice!),
      subtext:
        parseFloat(item.discount!) > 0
          ? `-${formatNumber(item.discount!)}`
          : "",
      width: colWitdh,
      align: "right",
    },
    {
      text: `${item.currentQuantity}`,
      width: colWitdh,
      align: "right",
    },
    {
      text: formatNumber(item.tax!),
      width: colWitdh,
      align: "right",
    },
    {
      text: formatNumber(item.total!),
      width: colWitdh,
      align: "right",
    },
  ]);
};

/**
 * create order invoice
 * @param order
 * @returns
 */
export async function createOrderInvoice(order: OrderType) {
  const { doc } = await initialize(order.storeId);

  const lineItems = generateRowData(order.lineItems);

  const itemsPerPage = 8;
  const pages = Math.ceil(lineItems.length / itemsPerPage);

  for (let i = 1; i <= pages; i++) {
    if (i > 1) {
      doc.addPage();
    }

    await createTemplate(i, order);

    const startIdx = (i - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageItems = lineItems.slice(startIdx, endIdx);

    // @ts-ignore
    drawTableRow(pageItems);

    drawTableTotal(order);
  }

  return doc.output("blob");
}
