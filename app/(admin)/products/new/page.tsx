"use client";
import { z } from "zod";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader, Trash2, Upload, ArrowLeft } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/query/products";
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
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";

import Options from "../components/options";
import Variants from "../components/variants";
import { Label } from "@/components/ui/label";
import { useCreateUpload, useDeleteFile } from "@/query/uploads";

const stringField = z.string().min(1, { message: "Required" });
const numberField = z
  .string()
  .min(1, { message: "Required" })
  .refine((arg) => !isNaN(Number(arg)), {
    message: "Required number",
  });

const formSchema = z.object({
  title: stringField,
  description: stringField,
  type: z.enum(["simple", "variable"]),
  status: z.enum(["active", "archived"]),
  image: stringField,
  options: z
    .object({
      name: stringField,
      values: stringField.array(),
    })
    .array(),
  variants: z
    .object({
      title: stringField,
      options: z.any(),
      sku: stringField,
      hsn: z.string(),
      purchasePrice: numberField,
      salePrice: numberField,
      taxRate: numberField,
    })
    .array(),
});

type FormValues = z.infer<typeof formSchema>;

const NewProductPage = () => {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const upload = useCreateUpload();
  const remove = useDeleteFile();
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      type: "simple" as const,
      status: "active" as const,
      image: "",
      options: [{ name: "Default", values: ["Default"], value: "" }],
      variants: [],
    },
  });

  const imageUrl = form.watch("image");

  const onSubmit = (values: FormValues) => {
    createProduct.mutate(values, {
      onSuccess: ({ data }) => {
        router.replace(`/products/${data.id}`);
      },
    });
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="flex flex-col sm:flex-row md:col-span-3">
          <div className="flex gap-3">
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

            <div className="space-y-1">
              <CardTitle>Add Product</CardTitle>
              <CardDescription>Add product and start selling</CardDescription>
            </div>
          </div>
          <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              className="md:order-2 min-w-36"
              disabled={createProduct.isPending || upload.isPending}
            >
              {createProduct.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                "Create Product"
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
          <Card className="p4 md:p-6 space-y-6">
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

export default NewProductPage;
