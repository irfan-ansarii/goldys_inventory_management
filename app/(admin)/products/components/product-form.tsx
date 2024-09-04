"use client";
import { z } from "zod";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader, Trash2, Upload } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateProduct, useUpdateProduct } from "@/query/products";
import { useCreateUpload, useDeleteFile } from "@/query/uploads";
import { useRouter } from "next/navigation";

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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";

import Options from "./options";
import Variants from "./variants";

const stringField = z.string().min(1, { message: "Required" }).or(z.number());

const numberField = z
  .string()
  .min(1, { message: "Required" })
  .refine((arg) => !isNaN(Number(arg)), {
    message: "Required number",
  });

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(["simple", "variable"]),
  status: z.enum(["active", "archived"]),
  image: z.any(),
  options: z
    .object({
      name: z.string(),
      values: z.string().array(),
    })
    .array(),
  variants: z
    .object({
      variantId: stringField.or(z.any()),
      title: z.string(),
      options: z.any(),
      purchasePrice: numberField,
      salePrice: numberField,
      sku: z.any(),
      hsn: z.string(),
      taxRate: numberField,
    })
    .array(),
});

type FormValues = z.infer<typeof formSchema>;

const ProductForm = ({
  defaultValues,
  id,
}: {
  defaultValues: FormValues;
  id?: any;
}) => {
  const { title, description, type, status, image, options, variants } =
    defaultValues;

  const create = useCreateProduct();
  const update = useUpdateProduct(id);
  const upload = useCreateUpload();
  const remove = useDeleteFile();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title,
      description,
      type,
      status,
      image,
      options,
      variants,
    },
  });

  const imageUrl = form.watch("image");

  const onSubmit = (values: FormValues) => {
    if (id) {
      const { variants } = values;

      const modifiedVariants = variants.map((v) => ({
        ...v,
        id: v.variantId,
      }));

      update.mutate({ ...values, variants: modifiedVariants });
    } else {
      create.mutate(values, {
        onSuccess: ({ data }) => {
          router.replace(`/products/${data.id}`);
        },
      });
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      const tempImage = URL.createObjectURL(files[0]);
      form.setValue("image", tempImage);

      upload.mutate(files[0], {
        onSuccess: ({ data }) => form.setValue("image", data.url),
        onError: () => form.setValue("image", ""),
      });
    }
  };

  const removeFile = (url: string) => {
    form.setValue("image", "");
    remove.mutate(url, {
      onError: () => form.setValue("image", url),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="flex flex-col md:flex-row  md:col-span-3">
          <div className="flex gap-3 items-center">
            <Link
              href="/products"
              className={buttonVariants({
                variant: "outline",
                size: "icon",
                className: "flex-none",
              })}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="space-y-1 truncate">
              <CardTitle className="truncate text-lg">
                {id ? defaultValues.title : "Create Product"}
              </CardTitle>
            </div>
          </div>
          <div className="md:ml-auto mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
            <Button
              type="submit"
              className="md:order-2 min-w-36"
              disabled={
                update.isPending || create.isPending || !form.formState.isDirty
              }
            >
              {update.isPending || create.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="p-4 md:p-6 space-y-6">
            <CardTitle className="text-lg">Product Details</CardTitle>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Options />
          <Variants />
        </div>
        <div className="space-y-6">
          <Card className="p-4 md:p-6">
            <CardTitle className="text-lg mb-6">Product Status</CardTitle>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          <Card className="p-4 md:p-6 space-y-6">
            <CardTitle className="text-lg">Product Image</CardTitle>

            <div className="relative aspect-square rounded-md overflow-hidden">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    className={`object-cover ${
                      upload.isPending ? "blur-sm" : ""
                    }`}
                    fill
                    alt={imageUrl}
                    sizes="100vw"
                  />
                </>
              ) : (
                <Label
                  htmlFor="file"
                  className="absolute rounded-md cursor-pointer inset-0 border-2 border-dashed flex flex-col items-center justify-center"
                >
                  <span className="w-10 h-10 rounded-full bg-secondary inline-flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-muted-foreground mt-4">
                    Select Image
                  </span>
                  <Input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </Label>
              )}
            </div>

            {imageUrl && !upload.isPending && (
              <Button
                className="w-full border-dashed p-0 relative"
                variant="outline"
                type="button"
                disabled={remove.isPending}
                onClick={() => removeFile(imageUrl)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </Card>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
