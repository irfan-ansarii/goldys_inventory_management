import React from "react";
import { PlusCircle } from "lucide-react";

import { getStores, StoreType } from "@/query/stores";

import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import StoresPopup from "./stores-popup";
import StoreAction from "./store-action";
import Avatar from "@/components/custom-ui/avatar";

interface Props extends Omit<StoreType, "address"> {
  address: { [k: string]: string };
}

const StoresPage = async () => {
  const { data } = (await getStores()) as { data: Props[] };

  return (
    <div className="space-y-6">
      <CardTitle className="text-lg">Stores</CardTitle>

      <div className="divide-y">
        {data.map((store, i) => (
          <div
            className="grid grid-cols-4 overflow-hidden gap-3 py-2 first:pt-0 last:pb-0"
            key={store.id}
          >
            <div className="flex items-start gap-3 overflow-hidden col-span-2">
              <Avatar src={store.logo} />
              <div className="overflow-hidden flex-1">
                <p className="text-sm truncate">{store.name}</p>
                <p className="text-sm leading-relaxed">{store.company}</p>
                <p className="text-xs text-muted-foreground ">
                  {store.address?.address}
                  <br />
                  {store.address?.city} {store.address?.state} -{" "}
                  {store.address?.pincode}
                </p>
              </div>
            </div>
            <div className="text-sm flex flex-col">
              <a href={`tel:${store.phone}`} className="underline">
                {store.phone}
              </a>
              <a href={`mailto:${store.email}`} className="underline">
                {store.email}
              </a>
            </div>
            <StoreAction store={store} />
          </div>
        ))}
      </div>
      <StoresPopup>
        <Button className="w-full" variant="secondary">
          <PlusCircle className="w-4 h-4 mr-2" /> Add Store
        </Button>
      </StoresPopup>
    </div>
  );
};

export default StoresPage;
