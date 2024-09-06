"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateReturn, useProcessOrder } from "@/query/orders";
import { useRouter } from "next/navigation";

import { Loader, Trash2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@/components/ui/dialog";

import Popup from "@/components/custom-ui/popup";
import Avatar from "@/components/custom-ui/avatar";

const couriers = [
  {
    name: "Shiprocket",
    url: "https://goldysnestt.shiprocket.co/tracking/",
  },

  {
    name: "Trackon Courier",
    url: "https://trackon.in/Tracking/t2/MultipleTracking?",
  },
  {
    name: "Blue Dark",
    url: "https://bluedart.com/tracking?",
  },
  {
    name: "DTDC",
    url: "https://www.dtdc.in/tracking.asp?",
  },
  {
    name: "DHL",
    url: "https://www.dhl.com/in-en/home/tracking.html?tracking-id=",
  },
  {
    name: "Aramex",
    url: "https://www.aramex.com/ae/en/track/shipments?",
  },
  {
    name: "Other",
    url: "",
  },
];

const schema = z.object({
  carrier: z.string(),
  awb: z.string(),
  trackingUrl: z.string(),
  lineItems: z
    .object({
      lineItemId: z.number(),
      productId: z.any(),
      variantId: z.any(),
      title: z.string(),
      variantTitle: z.string(),
      image: z.string().or(z.literal(``)),
      price: z.number().or(z.string()),
      quantity: z
        .string()
        .or(z.number())
        .default(1) /** quantity being shipped */,
      max: z.number(),
    })
    .superRefine(({ quantity, max }, ctx) => {
      const qty = parseInt(`${quantity}`);
      if (isNaN(qty) || qty > max || qty === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantity"] });
      }
    })
    .array()
    .min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  children: React.ReactNode;
  orderId: number;
  shipmentId?: number;
  items: FormValues["lineItems"];
}

const ProcessPopup = ({ children, orderId, shipmentId, items }: Props) => {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lineItems: items,
      carrier: "",
      awb: "",
      trackingUrl: "",
    },
  });

  const shipOrder = useProcessOrder(`${orderId}`);
  const returnOrder = useCreateReturn({
    orderId,
    shipmentId,
  });

  const lineItems = form.watch("lineItems");
  const courier = form.watch("carrier");
  const awb = form.watch("awb");

  const handleRemove = (index: number) => {
    lineItems.splice(index, 1);
    form.setValue(`lineItems`, lineItems);
  };

  const onSubmit = (values: FormValues) => {
    const { lineItems } = values;

    const linePayload = lineItems.map((line) => ({
      ...line,
      price: `${line.price}`,
      total: `${(line.quantity as number) * (line.price as number)}`,
    }));

    if (shipmentId) {
      returnOrder.mutate(
        { ...values, lineItems: linePayload },
        {
          onSuccess: () => {
            router.refresh();
            setOpen(false);
          },
        }
      );
    } else {
      shipOrder.mutate(
        { ...values, lineItems: linePayload },
        {
          onSuccess: () => {
            router.refresh();
            setOpen(false);
          },
        }
      );
    }
  };

  React.useEffect(() => {
    const carrier = couriers.find((c) => c.name === courier);
    form.setValue("trackingUrl", `${carrier ? `${carrier.url}${awb}` : ""}`);
  }, [courier, awb]);

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      variant="sheet"
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-2 md:p-4 flex flex-col gap-6 h-full relative"
          >
            <DialogTitle className="mb-4">
              {shipmentId ? "Initiate Return" : "Ship Order Items"}
            </DialogTitle>

            <div className="flex-1 overflow-y-scroll space-y-2">
              {lineItems?.map((field, i) => (
                <div
                  className="p-3 grid grid-cols-3 gap-2 border rounded-lg"
                  key={field.lineItemId}
                >
                  <div className="flex items-start gap-3 col-span-2 overflow-hidden">
                    <Avatar src={field.image || field.title} />
                    <div className="overflow-hidden">
                      <p className="text-sm leading-tight truncate">
                        {field.title}
                      </p>
                      <Badge variant="secondary" className="py-0">
                        {field.variantTitle}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-x-2 flex">
                    <div className="relative ml-auto w-24">
                      <Input
                        placeholder="0"
                        className={
                          form.getFieldState(`lineItems.${i}`)?.invalid
                            ? "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                            : ""
                        }
                        {...form.register(`lineItems.${i}.quantity`)}
                      />

                      <span className="absolute flex inset-0 justify-between items-center pointer-events-none px-3 text-sm text-muted-foreground">
                        <span className="invisible">q</span>
                        <span>/</span>
                        <span>{field.max}</span>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-auto px-2 text-muted-foreground"
                      type="button"
                      disabled={lineItems?.length === 1}
                      onClick={() => handleRemove(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="font-medium">Tracking information</div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courier</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Courier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {couriers.map((courier) => (
                          <SelectItem value={courier.name} key={courier.name}>
                            {courier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="trackingUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Link</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full"
              disabled={shipOrder.isPending || returnOrder.isPending}
            >
              {shipOrder.isPending || returnOrder.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : shipmentId ? (
                "Initiate Return"
              ) : (
                "Ship"
              )}
            </Button>
          </form>
        </Form>
      }
    >
      {children}
    </Popup>
  );
};

export default ProcessPopup;
