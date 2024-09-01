import React, { useCallback, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { X, Plus, Trash2, PlusCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Options = () => {
  const form = useFormContext();

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: `options`,
  });

  const isSimpleProduct = form.watch("type") === "simple";

  const setValues = useCallback(
    (value: string, index: number) => {
      if (!value) return;
      const values = form.getValues(`options.${index}.values`);

      if (values.includes(value)) {
        form.setError(`options.${index}.value`, {
          type: "custom",
          message: "Value already exist",
        });
        return;
      }
      form.clearErrors(`options.${index}.value`);
      form.setValue(`options.${index}.values`, [...values, value]);
      form.setValue(`options.${index}.value`, "");
      form.setFocus(`options.${index}.value`);
    },
    [form]
  );

  const handleKeyDown = React.useCallback(
    (e: any, index: number) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setValues(e.target.value, index);
      }
    },
    [setValues]
  );

  const handleRemove = (optionIndex: number, valueIndex: number) => {
    const values = form.getValues(`options.${optionIndex}.values`);
    values.splice(valueIndex, 1);
    form.setValue(`options.${optionIndex}.values`, [...values]);
  };

  useEffect(() => {
    const isDirty = form.formState.dirtyFields.type;
    if (isDirty) {
      if (isSimpleProduct) {
        form.setValue("options", [
          { name: "Default", values: ["Default"], value: "" },
        ]);
      } else {
        form.setValue("options", [{ name: "", values: [], value: "" }]);
      }
    }
  }, [isSimpleProduct]);

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <CardTitle className="text-lg">Options</CardTitle>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel>Product Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4"
              >
                <FormItem className="space-y-0">
                  <FormLabel className="flex cursor-pointer justify-between rounded-md p-3 border-2">
                    Simple
                    <FormControl>
                      <RadioGroupItem value="simple" />
                    </FormControl>
                  </FormLabel>
                </FormItem>
                <FormItem className="space-y-0">
                  <FormLabel className="flex cursor-pointer justify-between rounded-md p-3 border-2">
                    Variable
                    <FormControl>
                      <RadioGroupItem value="variable" />
                    </FormControl>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isSimpleProduct ? (
        <>
          {fields.map((item, index) => (
            <div key={item.id} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name={`options.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="Option name" {...field} />
                      </FormControl>
                      <Button
                        variant="destructive"
                        type="button"
                        size="icon"
                        className="absolute inset-y-0 right-0"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full space-y-3">
                <FormField
                  control={form.control}
                  name={`options.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Option value"
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        </FormControl>
                        <Button
                          variant="secondary"
                          size="icon"
                          type="button"
                          disabled={!form.watch(`options.${index}.value`)}
                          className="absolute inset-y-0 right-0"
                          onClick={() => {
                            const value = form.getValues(
                              `options.${index}.value`
                            );
                            setValues(value, index);
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 flex-wrap">
                  {form
                    .watch(`options.${index}.values`)
                    .map((item: string, i: number) => (
                      <Badge
                        className="pr-1 py-1 gap-2 overflow-hidden justify-between"
                        variant="outline"
                        key={`${item}${i}`}
                      >
                        <span>{item}</span>
                        <span
                          onClick={() => {
                            handleRemove(index, i);
                          }}
                          className="bg-secondary hover:bg-destructive w-4 flex items-center justify-center h-4 rounded-full cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          ))}

          <Button
            className="w-full"
            variant="secondary"
            type="button"
            onClick={() => {
              append({ name: "", values: [], value: "" });
            }}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Variant
          </Button>
        </>
      ) : null}
    </Card>
  );
};

export default Options;
