"use client";
import Lottie from "react-lottie";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import Popup from "@/components/custom-ui/popup";
import SupplierTab from "./supplier-tab";
import NotesTab from "./notes-tab";
import PaymentTab from "./payment-tab";
import InvoiceTab from "./invoice-tab";
import * as animationData from "@/public/animation-confetti.json";
export type CreatedOrdertype = {
  id: number;
  total: string;
  due: string;
};

const defaultOption = {
  loop: false,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const tabClass =
  "[&>*]:flex [&>*]:flex-col [&>*]:gap-3 [&>*]:h-[34rem] focus-visible:ring-0";

const CheckoutPopup = ({ disabled }: { disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("employee");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrdertype>();
  const [showConfetti, setShowConfetti] = useState(false);

  React.useEffect(() => {
    if (!showConfetti) return;
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showConfetti]);

  return (
    <Popup
      open={open}
      onOpenChange={(state) => {
        setOpen(state);
        setActive("supplier");
      }}
      content={
        <div className="p-2 md:p-6 relative">
          <Tabs value={active} onValueChange={setActive} className="[&>*]:mt-0">
            {showConfetti && (
              <div className="absolute inset-0">
                <Lottie options={defaultOption} />
              </div>
            )}
            <TabsContent value="supplier" className={tabClass}>
              <SupplierTab onNext={() => setActive("notes")} />
            </TabsContent>

            <TabsContent value="notes" className={tabClass}>
              <NotesTab
                onPrev={() => setActive("supplier")}
                onNext={(values: CreatedOrdertype) => {
                  setShowConfetti(true);
                  setCreatedOrder(values);
                  setActive("payment");
                }}
              />
            </TabsContent>

            <TabsContent value="payment" className={tabClass}>
              <PaymentTab
                onNext={() => setOpen(false)}
                purchase={createdOrder!}
              />
            </TabsContent>

            {/* ignore the invoice tab for purchase order */}
            {/* <TabsContent value="invoice" className={tabClass}>
              <InvoiceTab onNext={() => setOpen(false)} order={createdOrder} />
            </TabsContent> */}
          </Tabs>
        </div>
      }
    >
      <Button className="w-full" disabled={disabled}>
        Checkout
      </Button>
    </Popup>
  );
};

export default CheckoutPopup;
