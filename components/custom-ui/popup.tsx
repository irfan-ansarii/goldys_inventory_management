"use client";
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  open?: boolean;
  onOpenChange?: (state: boolean) => void;
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: "sheet" | "dialog" | "popover";
  className?: string;
}
const Popup = ({
  open,
  onOpenChange,
  content,
  children,
  variant = "dialog",
  className,
}: Props) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop && variant === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={cn("p-2 border-none", className)}>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  if (isDesktop && variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className={cn("p-2 sm:max-w-md border-none", className)}>
          {content}
        </SheetContent>
      </Sheet>
    );
  }
  if (isDesktop && variant === "popover") {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent side="bottom" className={cn("w-auto p-2", className)}>
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={cn("p-2 pb-6 border-none", className)}>
        {content}
      </DrawerContent>
    </Drawer>
  );
};

export default Popup;
