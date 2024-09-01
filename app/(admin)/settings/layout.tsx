import React from "react";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import Navigations from "./components/navigations";

export const metadata: Metadata = {
  title: "Settings",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="mb-6 flex">
        <div className="space-y-1">
          <CardTitle>Settings</CardTitle>
          <CardDescription>View and manage your orders.</CardDescription>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6">
          <Card className="col-span-12 lg:col-span-3">
            <CardContent className="p-6">
              <Navigations />
            </CardContent>
          </Card>
          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardContent className="flex flex-col p-6">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
