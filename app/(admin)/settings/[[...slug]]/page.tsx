import React, { lazy } from "react";
import { redirect } from "next/navigation";

const StoresPage = lazy(() => import("./components/stores"));
const InvoicePage = lazy(() => import("./components/invoice"));
const Barcode = lazy(() => import("./components/barcode"));
const PaymentModes = lazy(() => import("./components/payment-modes"));
const UsersPage = lazy(() => import("./components/users"));

const SettingsPage = async ({ params }: { params: { slug: string[] } }) => {
  let slug = params.slug?.[0];

  if (!slug) {
    redirect("/settings/barcode");
  }
  switch (slug) {
    /** Barcode */
    case "barcode":
      return <Barcode />;

    /** Incoice */
    case "invoice":
      return <InvoicePage />;

    /** Payment Modes */

    case "payment-modes":
      return <PaymentModes />;

    /** Stores */
    case "stores":
      return <StoresPage />;

    /** Users */
    case "users":
      return <UsersPage />;

    /** Notifications */
    default:
      return (
        <div className="py-20 text-center">
          <span className="text-muted-foreground text-sm">Coming Soon</span>
        </div>
      );
  }
};

export default SettingsPage;
