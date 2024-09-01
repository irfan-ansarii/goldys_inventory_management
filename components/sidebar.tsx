import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { MENU_ITEMS } from "@/lib/menu-items";
import { getStores } from "@/query/stores";
import { getSession } from "@/query/users";

import { ChevronsUpDown, Home, PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { NavItem } from "./nav-item";

import Popup from "./custom-ui/popup";
import StoreItem from "./store-item";

import ProfileForm from "./profile-form";

const Sidebar = async ({ className }: { className?: string }) => {
  const { data: session } = await getSession();
  const { data: stores } = await getStores();

  return (
    <div className={cn("flex h-full max-h-screen flex-col gap-2", className)}>
      <div className="flex items-center border-b px-5 pt-5">
        <Link
          className="flex w-full items-center gap-2 font-semibold relative h-[60px]"
          href="/dashboard"
        >
          <Image
            alt="Logo"
            src={session?.store?.logo as string}
            fill
            // placeholder="blur"
            className="object-cover"
          />
        </Link>
      </div>

      <div className="px-4 pt-2">
        {session?.role === "admin" ? (
          <Popup
            variant="popover"
            content={
              <div className="flex flex-col gap-1 min-w-[228px]">
                {stores.map((store) => (
                  <StoreItem store={store} key={store.id} />
                ))}

                <Link
                  href="/settings/stores"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "!justify-start",
                  })}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Store
                </Link>
              </div>
            }
          >
            <Button variant="outline" className="w-full border justify-start">
              <Home className="w-4 h-4 mr-2" />
              {session?.store?.name || "Select store"}
              <ChevronsUpDown className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          </Popup>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full border justify-start"
          >
            <Home className="w-4 h-4 mr-2" />
            {session?.store?.name || "Select store"}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-scroll divide-y overflow-x-hidden py-2 !-mr-0.5">
        <nav className="grid items-start gap-2 px-4 text-sm font-medium">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavItem href={`/${item.slug}`} key={item.slug}>
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {item.title}
                </span>
                {item.label && <Badge className="text-xs">{item.label}</Badge>}
              </NavItem>
            );
          })}
        </nav>
      </div>

      <div className="px-4 my-5">
        <ProfileForm defaultValues={session} />
      </div>
    </div>
  );
};

export default Sidebar;
