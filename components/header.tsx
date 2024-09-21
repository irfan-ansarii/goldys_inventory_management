import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlignLeft } from "lucide-react";
import { SessionType } from "@/query/users";

import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./sidebar";
import ProfileForm from "./profile-form";

const Header = ({ session }: { session: SessionType }) => {
  const logo = session?.store?.logo;

  return (
    <header className="lg:hidden flex h-16 sticky top-0 z-20 bg-background/10 backdrop-blur px-4 md:px-6 items-center gap-4 border-b justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="link" className="shrink-0">
            <AlignLeft className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <Link
        className="inline-flex w-full justify-center items-center gap-2 font-semibold relative "
        href="/dashboard"
      >
        <Image
          alt="Logo"
          width={140}
          height={100}
          src={logo as string}
          className="dark:invert"
        />
      </Link>

      <ProfileForm defaultValues={session} compact />
    </header>
  );
};

export default Header;
