"use client";
import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const paths = [
  { label: "Products", href: "/products" },
  { label: "Transfers", href: "/products/transfers" },
  { label: "Adjustments", href: "/products/adjustments" },
  { label: "Barcodes", href: "/products/barcodes" },
];

const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="inline-flex w-auto rounded-md bg-secondary gap-1 p-1 mb-6">
      {paths.map((path) => (
        <Link
          key={path.href}
          href={path.href}
          className={buttonVariants({
            variant: pathname === path.href ? "outline" : "ghost",
            size: "sm",
            className: "border-none truncate",
          })}
        >
          {path.label}
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
