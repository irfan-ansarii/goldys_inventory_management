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
    <div className="flex flex-nowrap rounded-md bg-secondary gap-1 p-1 mb-6 max-w-[calc(100vw-2rem)] overflow-auto">
      {paths.map((path) => (
        <Link
          key={path.href}
          href={path.href}
          className={buttonVariants({
            variant: pathname === path.href ? "outline" : "ghost",
            size: "sm",
            className: "border-none",
          })}
        >
          {path.label}
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
