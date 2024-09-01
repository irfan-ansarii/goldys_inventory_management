"use client";
import React, { useState } from "react";
import { AlignLeft, LogOut } from "lucide-react";

import { Button } from "./ui/button";
import { Sheet, SheetContent } from "./ui/sheet";
import Sidebar from "./sidebar";

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="lg:hidden flex h-16 sticky top-0 z-20 bg-background/10 backdrop-blur px-4 md:px-6 items-center gap-4 border-b justify-between">
      <Button size="icon" variant="link" onClick={() => setOpen(!open)}>
        <AlignLeft className="w-6 h-6" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
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
