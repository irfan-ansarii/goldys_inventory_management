"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const path = href?.replace(/\/\//g, "/");

  return (
    <Link
      href={path}
      className={buttonVariants({
        variant: pathname.includes(path) ? "default" : "ghost",
        size: "sm",
        className: "justify-between",
      })}
    >
      {children}
    </Link>
  );
}
