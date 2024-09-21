import {
  BarChart,
  BarChart2,
  BarChartBig,
  ClipboardList,
  FilePenLine,
  Inbox,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";

export const MENU_ITEMS = [
  {
    title: "Dashboard",
    slug: "/dashboard",
    label: "New",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    slug: "/orders",
    icon: ShoppingBag,
  },

  {
    title: "Purchases",
    slug: "/purchases",
    icon: Inbox,
  },
  {
    title: "Products",
    slug: "/products",
    icon: Tags,
  },
  {
    title: "Expenses",
    slug: "/expenses",
    icon: FilePenLine,
  },
  {
    title: "Contacts",
    slug: "/contacts",
    icon: Users,
  },
  {
    title: "Tasks",
    slug: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Reports",
    slug: "/reports",
    icon: BarChartBig,
  },

  {
    title: "Settings",
    slug: "/settings",
    icon: Settings,
  },
];
