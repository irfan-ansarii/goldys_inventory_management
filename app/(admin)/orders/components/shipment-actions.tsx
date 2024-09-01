"use client";
import React, { useState } from "react";
import z from "zod";
import {
  ShipmentType,
  useCancelShipment,
  useEditShipment,
} from "@/query/orders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Download,
  EllipsisVertical,
  Pencil,
  Truck,
  CircleX,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { DialogTitle } from "@/components/ui/dialog";
import Popup from "@/components/custom-ui/popup";
import DeletePopup from "@/components/delete-popup";

const schema = z.object({
  carrier: z.string(),
  awb: z.string(),
  trackingUrl: z.string(),
});

type FormValues = z.infer<typeof schema>;

const ShipmentActions = ({ shipment }: { shipment: ShipmentType }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      carrier: shipment.carrier!,
      awb: shipment.awb!,
      trackingUrl: shipment.trackingUrl!,
    },
  });

  const cancel = useCancelShipment({
    orderId: shipment.orderId,
    shipmentId: shipment.id,
  });
  const update = useEditShipment({
    orderId: shipment.orderId,
    shipmentId: shipment.id,
    action: "edit",
  });

  const onSubmit = (values: FormValues) => {
    update.mutate(values, {
      onSuccess: () => {
        router.refresh();
        setOpen(false);
      },
    });
  };

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
        setCancelOpen(false);
      },
    });
  };

  return (
    <Popup
      variant="popover"
      content={
        <div className="flex flex-col md:w-44 [&>*]:justify-start">
          <Popup
            open={open}
            onOpenChange={setOpen}
            content={
              <Form {...form}>
                <form
                  className="space-y-6 p-4 md:p-6"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <DialogTitle>Edit Tracking</DialogTitle>
                  <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Courier </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                  <Button className="w-full" disabled={update.isPending}>
                    {update.isPending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </form>
              </Form>
            }
          >
            <Button
              variant="ghost"
              size="sm"
              disabled={!shipment.actions.includes("edit")}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Popup>

          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Label
          </Button>

          {/* track shipment button */}
          {shipment.trackingUrl ? (
            <a
              href={shipment.trackingUrl}
              target="_blank"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <Truck className="w-4 h-4 mr-2" />
              Track
            </a>
          ) : (
            <Button variant="ghost" disabled size="sm">
              <Truck className="w-4 h-4 mr-2" />
              Track
            </Button>
          )}

          {shipment.actions.includes("cancel") && (
            <DeletePopup
              open={cancelOpen}
              onOpenChange={setCancelOpen}
              onDelete={handleCancel}
              loading={cancel.isPending}
              actionText={
                <>
                  <CircleX className="w-4 h-4 mr-2" />
                  Cancel Shipment
                </>
              }
              content={{
                title: "Are you absolutely sure?",
                description: "The shipment will be deleted permanentlty",
              }}
            />
          )}
        </div>
      }
    >
      <Button size="icon" variant="outline">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default ShipmentActions;
