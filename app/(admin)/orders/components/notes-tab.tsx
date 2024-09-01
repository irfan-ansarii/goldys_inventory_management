import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Loader,
  X,
} from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Popup from "@/components/custom-ui/popup";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCreateOrder, useUpdateOrder } from "@/query/orders";
import { CreatedOrdertype } from "./checkout-popup";
import { OrderFormValues } from "./form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Props {
  onPrev: () => void;
  onNext: (p: CreatedOrdertype) => void;
}
const NotesTab = ({ onPrev, onNext }: Props) => {
  const form = useFormContext<OrderFormValues>();
  const orderId = form.getValues("id");
  const tags = (form.watch("tags") as string[]) || [];

  const router = useRouter();

  const { mutate: create, isPending } = useCreateOrder();
  const { mutate: update, isPending: isUpdating } = useUpdateOrder(orderId);

  // handle tag change
  const handleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { value } = target;
    if (e.key !== "Enter" || !value) return;

    const updatedValues = tags.includes(value)
      ? tags.filter((v) => v !== value)
      : [...tags, value];

    form.setValue("tags", updatedValues);
    target.value = "";
  };

  // handle remove tag
  const handleRemoveTag = (index: number) => {
    tags.splice(index, 1);
    form.setValue("tags", tags);
  };

  // handle require shipping
  const onCheckedChange = (v: boolean) => {
    const lines = form.getValues("lineItems");
    const updated = lines.map((line) => ({ ...line, requiresShipping: v }));
    form.setValue("lineItems", updated);
  };

  const handleNext = (orderData: any) => {
    if (orderId) {
      // update order
      update(orderData, {
        onSuccess: ({ data }) => {
          onNext({
            id: data.id,
            total: data.total,
            due: data.due,
          });
          form.reset();
          router.refresh();
        },
      });
    } else {
      // create order
      create(orderData, {
        onSuccess: ({ data }) => {
          onNext({
            id: data.id,
            total: data.total,
            due: data.due,
          });
          form.reset();
          router.refresh();
        },
      });
    }
  };

  return (
    <div>
      <DialogHeader className="md:mb-3">
        <DialogTitle>Order Details</DialogTitle>
      </DialogHeader>

      <div className="h-full space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Order ID (Optional)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="createdAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popup
                variant="popover"
                content={
                  <Calendar
                    mode="single"
                    selected={field.value!}
                    onSelect={field.onChange}
                    initialFocus
                  />
                }
              >
                <FormControl>
                  <Button
                    variant={"outline"}
                    className="w-full pl-3 justify-start font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {field.value ? (
                      format(field.value, "PP")
                    ) : (
                      <span className="text-muted-foreground">
                        DD-MM-YYYY (Optional)
                      </span>
                    )}
                  </Button>
                </FormControl>
              </Popup>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between px-3 py-2 border rounded-lg h-10">
          <Label htmlFor="shipping" className="leading-none font-normal ">
            Require Shipping
          </Label>
          <Switch
            id="shipping"
            defaultChecked={false}
            onCheckedChange={onCheckedChange}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {/* @ts-ignore */}
                <Textarea
                  placeholder="Notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Input placeholder="Tags..." onKeyDown={handleChange} />

          {tags?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {tags?.map((tag, i) => (
                <Badge
                  variant="outline"
                  key={tag}
                  className="py-1 rounded-md pr-1"
                >
                  {tag}
                  <Button
                    variant="danger"
                    className="w-4 h-4 p-0 rounded-full ml-1.5"
                    onClick={() => handleRemoveTag(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex [&>*]:flex-1 gap-2">
        <Button
          type="button"
          onClick={onPrev}
          disabled={isPending || isUpdating}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Prev
        </Button>
        <Button
          type="button"
          disabled={isPending || isUpdating}
          onClick={form.handleSubmit(handleNext, handleNext)}
        >
          {isPending || isUpdating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotesTab;
