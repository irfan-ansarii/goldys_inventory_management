import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const Inventories = ({ data }: { data: any }) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="divide-y"
      defaultValue={data?.[0]?.storeId}
    >
      {data?.map((inv: any) => (
        <AccordionItem
          value={inv.storeId}
          key={inv.storeId}
          className="py-2 first:pt-0 last:pb-0 border-b-0"
        >
          <AccordionTrigger className="hover:no-underline font-normal [&>svg]:hidden  py-0">
            <div className="flex justify-between gap-4 flex-1 items-center">
              {inv.storeName}
              <Badge
                variant={(inv.stock || 0) >= 5 ? "success" : "destructive"}
                className="py-0"
              >
                {inv.stock}
              </Badge>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0 pt-2 space-y-1">
            {inv.products.map((p: any) => (
              <div
                className="flex justify-between items-center gap-4"
                key={p.id}
              >
                <p className="text-muted-foreground">{p.title}</p>
                <Badge
                  variant={(inv.stock || 0) >= 5 ? "success" : "destructive"}
                  className="py-0"
                >
                  {p.stock}
                </Badge>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default Inventories;
