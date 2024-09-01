"use client";
import React from "react";
import { useSwitchStore } from "@/query/stores";

import { StoreType } from "@/query/stores";
import { useAuth } from "@/hooks/use-auth";

import { Check, Loader } from "lucide-react";
import { Button } from "./ui/button";

const StoreItem = ({ store }: { store: StoreType }) => {
  const { login, data } = useAuth();
  const switchStore = useSwitchStore(store.id);

  const isChecked = store.id === data?.storeId;

  const onClick = () => {
    if (isChecked) {
      return;
    }
    switchStore.mutate(undefined, {
      onSuccess: ({ data }) => {
        login(data.token);
        window.location.reload();
      },
    });
  };

  return (
    <Button
      key={store.id}
      variant="ghost"
      size="sm"
      className={`justify-start ${
        isChecked ? "bg-secondary [&>.check]:inline" : ""
      }`}
      onClick={onClick}
      disabled={switchStore.isPending}
    >
      {store.name}

      <Loader
        className={`w-4 h-4 animate-spin ml-auto ${
          switchStore.isPending ? "opacity-100" : "opacity-0"
        }`}
      />
      <Check className="w-4 h-4 check hidden" />
    </Button>
  );
};

export default StoreItem;
