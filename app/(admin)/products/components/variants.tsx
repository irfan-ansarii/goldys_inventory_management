"use client";

import React, { useCallback, useEffect } from "react";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

const variantFields = [
  { name: "purchasePrice", label: "Purchase Price" },
  { name: "salePrice", label: "Sale Price" },
  { name: "sku", label: "SKU" },
  { name: "hsn", label: "HSN Code" },
  { name: "taxRate", label: "Tax Rate" },
];

const Variants = () => {
  const form = useFormContext();

  const options = useWatch({
    name: "options",
    control: form.control,
  });

  const {
    fields: variants,
    insert,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  function generateVariants(options: [{ name: string; values: string[] }]) {
    if (options && options.length > 1) {
      const hasAllOptions = options.every(
        (opt) => opt.name && opt.values.length > 0
      );
      if (!hasAllOptions) return null;
    }

    const generatedVariants: any[] = [];

    function generate(current: string[], index: number) {
      if (index === options.length) {
        const option = current.map((value, i) => ({
          name: options[i].name,
          value,
        }));

        const title = current.join("/");
        generatedVariants.push({
          title,
          options: option,
        });
      } else {
        const { values } = options[index];
        for (const value of values) {
          generate([...current, value], index + 1);
        }
      }
    }

    generate([], 0);
    return generatedVariants;
  }

  const updateVariants = useCallback(
    (generated: any) => {
      if (!generated) return;

      const existingVariants = form.watch("variants");

      for (let i = variants.length - 1; i >= 0; i--) {
        //@ts-ignore
        const { title } = variants[i];
        const index = generated.findIndex((v: any) => v.title === title);
        if (index === -1) remove(i);
      }

      for (let i = 0; i < generated.length; i++) {
        const variant = generated[i];
        const index = existingVariants.findIndex(
          (v: any) => v.title === variant.title
        );

        if (index === -1)
          insert(
            i,
            {
              ...variant,
              purchasePrice: "",
              salePrice: "",
              sku: "",
              hsn: "",
              taxRate: "",
            },
            { shouldFocus: false }
          );
      }
    },
    [form, insert, remove, variants]
  );

  useEffect(() => {
    const generated = generateVariants(options);
    updateVariants(generated);
  }, [options, updateVariants]);

  if (!variants || variants.length === 0) return;

  return (
    <Card>
      <CardTitle className="p-4 md:p-6 text-lg"> Variants</CardTitle>

      {variants.map((field, index) => (
        <div className="overflow-hidden" key={field.id}>
          {/* variant header */}
          <Badge
            variant="secondary"
            className="w-full rounded-none text-sm py-3 px-4 md:px-6"
          >
            <span className="mr-2">{index + 1}.</span>
            {form.watch(`variants.${index}.title`)}
          </Badge>

          {/* variant fields */}
          <div className="p-4 md:p-6 grid sm:grid-cols-5 gap-4">
            {variantFields.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={`variants.${index}.${f.name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
};

export default Variants;
