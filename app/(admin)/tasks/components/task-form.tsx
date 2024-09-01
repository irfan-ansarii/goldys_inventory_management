"use client";

import React, { useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useUsersData } from "@/query/users";
import { useCreateUpload, useDeleteFile } from "@/query/uploads";
import { TaskType, useCreateTask, useEditTask } from "@/query/tasks";
import { useRouter } from "next/navigation";

import {
  Check,
  CornerDownLeft,
  Loader,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DialogTitle } from "@/components/ui/dialog";

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
import Popup from "@/components/custom-ui/popup";
import Avatar from "@/components/custom-ui/avatar";
import { Calendar } from "@/components/ui/calendar";

const schema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.string().array(),
  files: z.string().array(),
  users: z.any().array(),
  dueAt: z.string().or(z.null()),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: FormValues;
  callback?: <T>(args: T) => void;
  children: React.ReactNode;
  taskId?: number;
};

const TaskForm = ({
  defaultValues = {
    title: "",
    description: "",
    tags: [],
    users: [],
    files: [],
    dueAt: null,
  },
  taskId,
  callback,
  children,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [calenderOpen, setCalenderOpen] = useState(false);
  const { data } = useUsersData({
    roles: ["admin", "employees", "user", "customer"],
  });
  const router = useRouter();

  const edit = useEditTask(`${taskId}`);
  const create = useCreateTask();
  const upload = useCreateUpload();
  const remove = useDeleteFile();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [tags, users, files] = useWatch({
    control: form.control,
    name: ["tags", "users", "files"],
    exact: true,
  });

  /** Handle tag */
  const handleTagChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { value } = target;
    if (e.key !== "Enter" || !value) return;

    const updatedValues = tags.includes(value)
      ? tags.filter((v) => v !== value)
      : [...tags, value];
    form.setValue("tags", updatedValues);
    target.value = "";
    e.preventDefault();
  };

  /** Handle user */
  const handleUserChange = (value: any) => {
    const obj = JSON.parse(value);
    const index = users.findIndex((user) => user.id === obj.id);

    if (index !== -1) {
      users.splice(index, 1);
    } else {
      users.push({
        id: obj.id,
        name: obj.name,
      });
    }
    form.setValue("users", users);
  };

  /** Handle remove */
  const handleRemove = (target: "files" | "users" | "tags", index: number) => {
    const targetValues = form.getValues(target);
    targetValues.splice(index, 1);
    form.setValue(target, targetValues);
  };

  /** Handle upload */
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: uploadedFiles } = e.target;

    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach((file, i) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          files.push(reader.result as string);
          form.setValue("files", files);

          upload.mutateAsync(file, {
            onSuccess: ({ data }) => {
              files[i] = data.url;
              form.setValue("files", files);
            },
            onError: () => files.splice(i, 1),
            onSettled: () => form.setValue("files", files),
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  /** Handle remove file */
  const removeFile = (url: string, index: number) => {
    files.splice(index, 1);
    form.setValue("files", files);
    remove.mutate(url, {
      onError: () => {
        files.splice(index, 0, url);
        form.setValue("files", files);
      },
    });
  };

  /** Handle Submit */
  const onSubmit = (values: FormValues) => {
    const usersIds = values.users.map((u) => `${u.id}`);
    if (taskId) {
      edit.mutate(
        { ...values, users: usersIds },
        {
          onSuccess: ({ data }) => {
            router.refresh();
            setOpen(false);
            callback?.(data);
          },
          onError: (e) => console.log(e),
        }
      );
    } else {
      create.mutate(
        { ...values, users: usersIds },
        {
          onSuccess: ({ data }) => {
            router.refresh();
            setOpen(false);
            callback?.(data);
          },
          onError: (e) => console.log(e),
        }
      );
    }
  };

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      variant="sheet"
      content={
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
            className="px-2 md:p-4 flex flex-col gap-6 h-full relative"
          >
            <DialogTitle>{taskId ? "Update Task" : "Create Task"}</DialogTitle>
            <div className="space-y-6 flex-1 overflow-y-scroll max-h-[30rem] md:max-h-none !-mx-4 !px-4">
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
                      <Textarea
                        placeholder="Type here..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due At</FormLabel>
                    <Popup
                      open={calenderOpen}
                      onOpenChange={setCalenderOpen}
                      variant="popover"
                      content={
                        <Calendar
                          mode="single"
                          selected={new Date(field.value!)}
                          onSelect={(date) => {
                            field.onChange(date?.toDateString());
                            setCalenderOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      }
                    >
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value
                            ? format(field.value, "PP")
                            : "DD-MM-YYYY"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </Popup>
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="relative">
                  <Input onKeyDown={handleTagChange} />
                  <span className="absolute w-10 inset-y-0 right-0 inline-flex items-center justify-center pointer-events-none text-muted-foreground">
                    <CornerDownLeft className="w-4 h-4" />
                  </span>
                </div>
                {tags?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {tags?.map((tag, i) => (
                      <Badge variant="outline" key={tag} className="py-1 pr-1">
                        {tag}
                        <Button
                          variant="danger"
                          type="button"
                          className="w-4 h-4 p-0 rounded-full ml-1.5"
                          onClick={() => handleRemove("tags", i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Assign to</Label>
                <Select value="" onValueChange={handleUserChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.data?.map((user) => {
                      const index = users.findIndex((u) => u.id === user.id);
                      return (
                        <SelectItem value={JSON.stringify(user)} key={user.id}>
                          <span
                            className={`absolute left-2 flex inset-y-0 w-3.5 items-center justify-center ${
                              index !== -1 ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </span>
                          {user.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <div className="mt-2 flex gap-1 flex-wrap">
                  {users.map((user, i) => (
                    <Badge
                      className="p-0 gap-1 pr-0.5 font-normal"
                      key={user.id}
                      variant="outline"
                    >
                      <Avatar className="w-6 h-6" src={user.name?.charAt(0)} />
                      {user.name}

                      <Button
                        variant="danger"
                        type="button"
                        className="w-4 h-4 p-0 rounded-full ml-1.5"
                        onClick={() => handleRemove("users", i)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Picture</Label>
                <Input
                  multiple
                  id="files"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                />

                <div className="flex flex-wrap gap-2">
                  {files.map((file, i) => (
                    <div className="relative group" key={file}>
                      <Avatar
                        className={`w-16 h-16 rounded-lg ${
                          file.startsWith("data:") ? "blur-[2px]" : ""
                        }`}
                        src={file}
                      />
                      <span
                        onClick={() => removeFile(file, i)}
                        className="absolute w-4 h-4 inline-flex items-center justify-center bg-secondary right-0 -top-1 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button disabled={create.isPending || edit.isPending} type="submit">
              {create.isPending || edit.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : taskId ? (
                "Update"
              ) : (
                "Create"
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

export default TaskForm;
