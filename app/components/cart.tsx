"use client";
import React from "react";

import Avatar from "@/components/custom-ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useStream } from "@/hooks/use-stream";
import { Button } from "@/components/ui/button";
import { publishNotification } from "@/hooks/use-publish-redis";

const Cart = () => {
  const stream = useStream();

  console.log(stream);

  const publish = async () => {
    await Promise.all([
      publishNotification({
        name: "hello",
        topic: "testing",
        date: new Date(),
      }),
    ]);
  };

  return (
    <div className="flex flex-col justify-center h-full gap-4">
      <h2 className="bg-gradient-to-r from-lime-500 via-orange-600 to-lime-500 bg-clip-text text-transparent text-4xl font-semibold">
        Dear [Name],
      </h2>
      <p className="text-c text-muted-foreground text-xl">
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam
        voluptatem ut quidem quos, voluptates beatae iste commodi facilis sed!
        Perferendis magnam rem facilis minus fuga cum obcaecati libero dolores
        incidunt
      </p>
      <div className="space-y-1 text-muted-foreground">
        <p>Regards</p>
        <p>Team Awesome Company</p>
      </div>

      <Button onClick={publish}>Test Redis</Button>
    </div>
  );

  return (
    <>
      <div className="flex-1 divide-y overflow-y-scroll max-h-[24rem]">
        {[...Array(10)].map((_, i) => (
          <div className="grid grid-cols-3 py-2 relative" key={i}>
            <div className="col-span-2 flex items-start gap-2 w-full">
              <Avatar src="" />
              <span className="bg-primary w-4 h-4 inline-flex items-center justify-center text-xs rounded-full absolute z-[1] text-black">
                {i + 1}
              </span>
              <div className="space-y-1 flex-1">
                <p>Lorem ipsum dolor sit.</p>
                <div className="flex justify-between">
                  <Badge variant="secondary" className="py-0">
                    S
                  </Badge>
                  <Badge variant="secondary" className="py-0">
                    1
                  </Badge>
                </div>
              </div>
            </div>
            <div className="spae-y-1 text-right">
              <p className="text-muted-foreground line-through">3984.00</p>
              <p>345.88</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between p-2 border rounded-lg bg-secondary">
        <span className="font-semibold">Total</span>
        <span className="font-semibold">1290.00</span>
      </div>
    </>
  );
};

export default Cart;
