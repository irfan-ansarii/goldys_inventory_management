"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

const settingRoutes = [
  {
    label: "Barcode",
    slug: "/barcode",
  },
  {
    label: "Invoice",
    slug: "/invoice",
  },
  {
    label: "Payment Modes",
    slug: "/payment-modes",
  },
  {
    label: "Stores",
    slug: "/stores",
  },
  {
    label: "Users",
    slug: "/users",
  },
  {
    label: "Incentives",
    slug: "/incentives",
  },
  {
    label: "Notifications",
    slug: "/notifications",
  },
  {
    label: "Template",
    slug: "/template",
  },
];

const linkClassName = `${buttonVariants({
  variant: "ghost",
})} !justify-start w-auto lg:w-full`;

const Navigations = () => {
  const pathname = usePathname();
  const [path, slug] = pathname?.split("/").filter((h) => h);
  const isActive = (path: string) => {
    return slug === path.replace("/", "");
  };

  return (
    <div className="gap-2 grid grid-cols-3 md:grid-cols-1">
      {settingRoutes.map((route) => (
        <Link
          key={route.slug}
          href={`/${path}${route.slug}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: `truncate ${linkClassName} ${
              isActive(route.slug) ? "bg-accent" : ""
            }`,
          })}
        >
          <span className="truncate"> {route.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigations;
