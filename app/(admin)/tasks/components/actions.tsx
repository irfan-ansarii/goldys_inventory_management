"use client";
import React, { useState } from "react";
import {
  CircleCheck,
  CircleX,
  Clock,
  EllipsisVertical,
  Eye,
  PauseCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Popup from "@/components/custom-ui/popup";
import TaskForm from "./task-form";
import DeletePopup from "@/components/delete-popup";
import ViewPopup from "./view-popup";

import { TaskType, useDeleteTask, useUpdateTask } from "@/query/tasks";
import { useRouter } from "next/navigation";

const Actions = ({ task }: { task: TaskType }) => {
  const [removeOpen, setRemoveOpen] = useState(false);

  const router = useRouter();
  const update = useUpdateTask(`${task.id}`);
  const remove = useDeleteTask(`${task.id}`);

  const handleAction = (action: string) => {
    update.mutate(action, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: ({ data }) => {
        router.refresh();
        setRemoveOpen(false);
      },
    });
  };
  return (
    <Popup
      variant="popover"
      content={
        <div>
          <div className="flex flex-col md:w-44 [&>*]:justify-start">
            <ViewPopup task={task}>
              <Button size="sm" variant="ghost">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </ViewPopup>
            {task.actions?.includes("edit") && (
              <TaskForm
                defaultValues={{
                  ...task,
                  tags: task.tags || [],
                  files: task.files || [],
                }}
                taskId={task.id}
              >
                <Button size="sm" variant="ghost">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </TaskForm>
            )}
            {task.actions?.includes("hold") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction("hold")}
              >
                <PauseCircle className="w-4 h-4 mr-2" />
                On Hold
              </Button>
            )}
            {task.actions?.includes("progress") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction("progress")}
              >
                <Clock className="w-4 h-4 mr-2" />
                In Progress
              </Button>
            )}
            {task.actions?.includes("complete") && (
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600"
                onClick={() => handleAction("complete")}
              >
                <CircleCheck className="w-4 h-4 mr-2" />
                Completed
              </Button>
            )}
            {task.actions?.includes("cancel") && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction("cancel")}
              >
                <CircleX className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            {task.actions?.includes("delete") && (
              <DeletePopup
                open={removeOpen}
                onOpenChange={setRemoveOpen}
                loading={remove.isPending}
                onDelete={handleRemove}
              />
            )}
          </div>
        </div>
      }
    >
      <Button className="px-2" variant="ghost">
        <EllipsisVertical className="w-5 h-5" />
      </Button>
    </Popup>
  );
};

export default Actions;
