import React from "react";
import { AlignLeft, LogOut } from "lucide-react";

import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import Sidebar from "./sidebar";

const Header = () => {
  return (
    <header className="lg:hidden flex h-16 sticky top-0 z-20 bg-background/10 backdrop-blur px-4 md:px-6 items-center gap-4 border-b justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="link">
            <AlignLeft className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <span className="font-semibold">APP LOGO</span>

      <Button size="icon" variant="destructive">
        <LogOut className="w-5 h-5" />
      </Button>
    </header>
  );
};

export default Header;
