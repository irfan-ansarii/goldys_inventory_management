import {
  createLineItems,
  createOrder,
  createTransactions,
  getOrder,
  getTransactions,
  updateOrder,
} from "@/drizzle/services/orders";
import { createUser, getUser } from "@/drizzle/services/users";
import { getVariantsProduct } from "@/drizzle/services/products";
import { formatValue, getOrderStatus } from "./utils";
import { parseISO } from "date-fns";
import {
  createAdminRestApiClient,
  AdminRestApiClient,
} from "@shopify/admin-api-client";
import { splitText } from "@/lib/utils";

interface ShippingLine {
  reason: string;
  amount: number;
}
interface Props {
  data: Record<string, any>;
  topic: string | undefined;
  store: Record<string, any>;
}
export const handleWebhhokOrder = async ({ data, store, topic }: Props) => {
  const order = await getOrder(undefined, {
    name: data.name,
    storeId: store.id,
  });

  const client = createAdminRestApiClient({
    storeDomain: store.domain!,
    apiVersion: "2024-07",
    accessToken: store.token!,
  });

  let action = "";

  if (order && order.shipmentStatus === "processing") action = "update";
  if (!order && topic === "orders/create") action = "create";

  if (!action) return new Promise<void>((res) => res());

  /**************
   * Hanlde Order
   *************/
  const {
    name,
    processed_at,
    cancelled_at,
    cancel_reason,
    billing_address,
    shipping_address,
    total_line_items_price /** subtotal */,
    current_total_discounts /** disocunt */,
    discount_applications /** discount codes */,
    current_total_tax /** tax */,
    current_total_price /** total */,
    total_outstanding /** due */,
    shipping_lines /** calculate shipping charge */,
    taxes_included,
    tax_lines,
    note,
    phone,
    email,
    customer,
    line_items,
  } = data;

  // get or create customer
  let user = await getUser(undefined, { email });
  if (!user) {
    user = await createUser({
      name: `${customer.first_name} ${customer.last_name}`,
      email,
      phone: phone || shipping_address?.phone || billing_address?.phone,
      role: "customer",
      address: {
        address: `${billing_address.address1} ${
          billing_address.address2 ? billing_address.address2 : ""
        }`,
        city: billing_address.city,
        state: billing_address.province,
        pincode: billing_address.zip,
      },
    });
  }

  const billing = formatAddress({ ...billing_address, email });

  const shipping = formatAddress(
    "address1" in shipping_address
      ? { ...shipping_address, email }
      : { ...billing_address, email }
  );

  // calculate and organize charges
  const charges = shipping_lines.reduce(
    (acc: ShippingLine, line: Record<string, string>) => {
      const amount = parseFloat(line.discounted_price);
      if (amount > 0) {
        acc = {
          reason: line.title,
          amount: acc?.amount || 0 + amount,
        };
      }
      return acc;
    },
    {}
  );

  // organize tax data
  const taxKind = {
    saleType: "",
    type: taxes_included ? "included" : "excluded",
  };

  const taxLines = tax_lines.map((tax: Record<string, string>) => ({
    name: tax.title,
    amount: parseFloat(tax.price),
  }));

  const createOrderData = {
    storeId: store.id,
    name: name,
    customerId: user.id,
    billing,
    shipping,
    subtotal: total_line_items_price,
    discount: current_total_discounts,
    tax: current_total_tax,
    charges,
    total: current_total_price,
    due: total_outstanding,
    taxKind,
    taxLines,
    discountLines: {
      reason: discount_applications?.map((app: any) => app.code).join(" "),
      amount: current_total_discounts,
    },
    notes: note,
    ...(action === "create" ? { shipmentStatus: "processing" } : {}),
    ...(cancelled_at && { shipmentStatus: "cancelled" }),
    createdAt: parseISO(processed_at),
    cancelledAt: cancelled_at ? parseISO(cancelled_at) : null,
    cancelReason: cancel_reason,
    additionalMeta: data,
  };

  let orderEntity = null;

  if (action === "create") orderEntity = await createOrder(createOrderData);
  if (action === "update")
    orderEntity = await updateOrder(order.id, createOrderData);

  /*********************
   * Handle Transactions
   ********************/
  const [txns, appTxns] = await Promise.all([
    getChannelTransactions(client, data.id),
    getTransactions(orderEntity?.id),
  ]);

  if (txns && appTxns) {
    const paymentIds = new Set(appTxns.map((txn) => txn.paymentId));

    const filtered = txns.filter(
      (txn) =>
        (txn.kind === "sale" || txn.kind === "refund") &&
        txn.status === "success" &&
        !paymentIds.has(`${txn.id}`)
    );

    const createTransactionsData = filtered.map((txn) => ({
      storeId: store.id,
      orderId: orderEntity?.id,
      name: txn.gateway
        .replace("gift_card", "Gift Card")
        .replace(/Razorpay.*/i, "Razorpay"),
      kind: txn.kind,
      amount: txn.amount,
      paymentId: txn.id,
    }));

    if (createTransactionsData.length > 0) {
      await createTransactions(createTransactionsData);
    }
  }

  // update order payment status
  const { paymentStatus, due } = await getOrderStatus(
    Number(orderEntity?.id),
    Number(orderEntity?.total)
  );

  updateOrder(orderEntity?.id, {
    paymentStatus,
    due,
  });

  // return early if topic is update do not create line items
  if (action === "update") {
    return new Promise((res) => res(true));
  }

  /***********************************************
   * handle line items only if the event is create
   **********************************************/
  const createLineItemsData = [];
  for (const line of line_items) {
    const {
      product_id,
      product_exists,
      title,
      variant_title,
      sku,
      properties,
      quantity,
      price,
      discount_allocations,
      current_quantity,
      requires_shipping,
      fulfillable_quantity,
    } = line;

    let variant;
    if (sku) {
      variant = await getVariantsProduct({ q: sku });
      variant = variant.data?.[0];
    }

    let image: string = "";

    // get product image
    if (!variant && product_id && product_exists) {
      image = await getChannelProductImages(client, product_id);
    }

    const { taxLines, tax } = tax_lines.reduce(
      (
        acc: { taxLines: Record<string, any>[]; tax: number },
        curr: Record<string, any>
      ) => {
        acc.tax += parseFloat(curr.price);
        acc.taxLines.push({
          name: curr.title,
          amount: curr.price,
        });
        return acc;
      },
      { taxLines: [], tax: 0 }
    );

    const lineDiscount =
      (discount_allocations as Record<string, any>[])?.reduce((acc, curr) => {
        return acc + parseFloat(curr.amount);
      }, 0) ?? 0;

    createLineItemsData.push({
      storeId: store.id,
      orderId: orderEntity?.id,
      productId: variant?.product?.id,
      variantId: variant?.id,
      title,
      variantTitle: variant_title,
      image: variant?.product?.image || image,
      barcode: variant?.barcode,
      sku,
      hsn: "",
      price,
      salePrice: price,
      quantity,
      currentQuantity: current_quantity || quantity,
      requiresShipping: requires_shipping,
      shippingQuantity: fulfillable_quantity,
      subtotal: formatValue(price * (current_quantity || quantity)),
      discount: lineDiscount,
      tax,
      total: formatValue(price * (current_quantity || quantity) - lineDiscount),
      taxLines,
      properties,
    });
  }

  return createLineItems(createLineItemsData);
};

/**
 * format address
 * @param args
 * @returns
 */
const formatAddress = (args: any) => {
  if (!args.address1) return [];
  const {
    first_name,
    last_name,
    phone,
    email,
    address1,
    address2,
    city,
    province,
    zip,
    country,
  } = args;

  const address = `${address1} ${
    address2 ? address2 : ""
  } ${city} ${province} - ${zip} ${country}`;

  const splitted = splitText(address);
  return [
    `${first_name} ${last_name}`,
    ...splitted,
    `Phone: ${phone}`,
    `Email: ${email}`,
  ];
};

const getChannelTransactions = async (
  client: AdminRestApiClient,
  orderId: string | number
) => {
  try {
    const res = await client.get(`orders/${orderId}/transactions`, {
      retries: 2,
    });

    if (res.ok) {
      const data = (await res.json()) as {
        transactions: Record<string, any>[];
      };
      return data.transactions;
    } else {
      return [];
    }
  } catch (error) {
    console.log("Error while fetching transactions skipping...");
    return [];
  }
};

// get image from shopify
const getChannelProductImages = async (
  client: AdminRestApiClient,
  productId: string | number
) => {
  try {
    const res = await client.get(`products/${productId}/images`, {
      retries: 2,
    });

    if (res.ok) {
      const { images } = (await res.json()) as {
        images: Record<string, any>[];
      };
      return images?.[0]?.src || "";
    }
    return "";
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "";
  }
};
