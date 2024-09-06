import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { twMerge } from "tailwind-merge";
import Bottleneck from "bottleneck";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  number: number | string,
  options?: Intl.NumberFormatOptions
) {
  const parsed = typeof number === "string" ? Number(number) : number;

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    // style: "currency",
    // currency: "INR",
    ...options,
  }).format(parsed);
}

export function formatDate(date: string | Date) {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } else if (isYesterday(parsedDate)) {
    return "Yesterday";
  }

  return format(parsedDate, "dd MMM, yyyy");
}
export const GLOBAL_ERROR = {
  status: 500,
  message: "Internal Server Error",
};

export const capitalizeText = (text: string) => {
  if (!text) return;

  const splitted = text.split(" ");

  const capitalized = splitted.map((string) => {
    const firstChar = string.charAt(0)?.toUpperCase();
    const restChar = string.substring(1);
    return `${firstChar}${restChar}`;
  });

  return capitalized.join(" ");
};

export const siteConfig = {
  name: "Goldy's Nestt",
  url: "https://app.goldysnestt.com",
  ogImage: "https://ui.shadcn.com/og.jpg",
  description:
    "Manage orders effortlessly across multiple stores with intuitive application",
  // links: {
  //   twitter: "https://twitter.com/shadcn",
  //   github: "https://github.com/shadcn-ui/ui",
  // },
};

export function getOrderBadgeClassNames(status: string): string {
  switch (status) {
    case "unpaid":
    case "refunded":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "paid":
      return "bg-green-600 hover:bg-green-700 text-white";
    case "partially paid":
    case "overpaid":
      return "bg-orange-600 hover:bg-orange-700 text-white";
    default:
      return "";
  }
}
export const getShipmentStatusBadgeClassNames = (status: string) => {
  switch (status) {
    case "cancelled":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "processing":
      return "bg-yellow-600 hover:bg-yellow-700 text-white";
    case "shipped":
      return "bg-purple-600 hover:bg-purple-700 text-white";
    case "delivered":
      return "bg-green-600 hover:bg-green-700 text-white";
    case "rto initiated":
    case "return initiated":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "returned":
    case "rto delivered":
      return "bg-orange-600 hover:bg-orange-700 text-white";
    default:
      return "bg-primary hover:bg-primary/80 text-primary";
  }
};
export const getTaskBadgeClassNames = (status: string) => {
  switch (status) {
    case "cancelled":
      return "bg-red-600 hover:bg-red-700 text-white";
    case "in progress":
      return "bg-purple-600 hover:bg-purple-700 text-white";
    case "on hold":
      return "bg-orange-600 hover:bg-orange-700 text-white";
    case "completed":
      return "bg-green-600 hover:bg-green-700 text-white";
    default:
      return "bg-primary";
  }
};
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const EXPENSE_CATEGORIES = [
  "Maintenance",
  "Marketing",
  "Packaging",
  "Salaries",
  "Shipping",
  "Utilities",
  "Other",
];

export const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 2000,
});
