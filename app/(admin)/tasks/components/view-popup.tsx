import React from "react";
import Popup from "@/components/custom-ui/popup";
import { TaskType } from "@/query/tasks";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { capitalizeText, getTaskBadgeClassNames } from "@/lib/utils";
import Avatar from "@/components/custom-ui/avatar";
import { format } from "date-fns";

const ViewPopup = ({
  task,
  children,
}: {
  task: TaskType;
  children: React.ReactNode;
}) => {
  return (
    <Popup
      variant="sheet"
      content={
        <div className="px-2 md:p-4 flex flex-col gap-6 h-full relative">
          <DialogTitle>{task.title}</DialogTitle>
          <div className="flex-1 overflow-y-scroll space-y-6 max-h-[30rem] md:max-h-none">
            <div className="space-y-2">
              <p className="font-medium">Status</p>
              <Badge className={getTaskBadgeClassNames(task.status)}>
                {capitalizeText(task.status!)}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Description</p>
              <DialogDescription>{task.description}</DialogDescription>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {task.tags?.map((tag, i) => (
                  <Badge variant="outline" key={tag} className="py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Assigned To</p>
              <div className="flex gap-1 flex-wrap">
                {task.users?.map((user: any) => (
                  <Badge
                    className="p-0 gap-1 pr-3 font-normal"
                    key={user.id}
                    variant="outline"
                  >
                    <Avatar className="w-6 h-6" src={user.name?.charAt(0)} />
                    {user.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {task.files?.map((file, i) => (
                  <div className="relative group" key={file}>
                    <Avatar className={`w-16 h-16 rounded-lg`} src={file} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">{capitalizeText(task.status)} by</p>
              <Badge className="p-0 gap-1 pr-3 font-normal" variant="outline">
                <Avatar
                  className="w-6 h-6"
                  src={task.updatedBy?.name?.charAt(0)}
                />
                {task.updatedBy?.name}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Created By</p>
              <Badge className="p-0 gap-1 pr-3 font-normal" variant="outline">
                <Avatar
                  className="w-6 h-6"
                  src={task.createdBy?.name?.charAt(0)}
                />
                {task.createdBy?.name}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Due At</p>
              <p className="text-muted-foreground">
                {task.dueAt ? format(task.dueAt, "PP") : "NA"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{capitalizeText(task.status)} At</p>
              <p className="text-muted-foreground">
                {format(task.updatedAt!, "PP")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Created At</p>
              <p className="text-muted-foreground">
                {format(task.createdAt!, "PP")}
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Popup>
  );
};

export default ViewPopup;
