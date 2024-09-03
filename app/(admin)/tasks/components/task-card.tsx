import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import Avatar, { AvatarGroup } from "@/components/custom-ui/avatar";
import Actions from "./actions";
import { capitalizeText, getTaskBadgeClassNames } from "@/lib/utils";
import { TaskType } from "@/query/tasks";

const TaskCard = ({ task }: { task: TaskType }) => {
  return (
    <Card className="hover:border-foreground transition duration-500">
      <CardContent className="flex gap-4 p-4 md:p-6">
        <div
          className={`${getTaskBadgeClassNames(task.status)} w-1 rounded-full`}
        ></div>
        <div className="grid grid-cols-3 gap-4 gap-y-2 w-full">
          <div className="col-span-2 space-y-1 overflow-hidden">
            <h2 className="font-medium truncate">{task.title}</h2>
            <CardDescription className="truncate">
              {task.description}
            </CardDescription>
          </div>
          <div className="col-span-1 flex gap-2 justify-end items-center">
            <Badge className={getTaskBadgeClassNames(task.status)}>
              {capitalizeText(task.status!)}
            </Badge>
            <Actions task={task} />
          </div>

          <div className="flex gap-4 items-center col-span-3">
            <span className="inline-flex gap-2 items-center">
              <Avatar src={task.createdBy?.name} className="w-7 h-7" />
              <p className="text-xs text-muted-foreground">
                By {task.createdBy?.name}
              </p>
            </span>
            <span className="inline-flex gap-2 items-center">
              <AvatarGroup>
                {task.users?.map((user: Record<string, any>) => (
                  <Avatar
                    key={user.id}
                    src={user.name}
                    title={user.name}
                    className="w-7 h-7"
                  />
                ))}
              </AvatarGroup>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
