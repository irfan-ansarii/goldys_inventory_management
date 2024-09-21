"use client";
import React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Check, ChevronDown, ListFilter, PlusCircle } from "lucide-react";

import Popup from "@/components/custom-ui/popup";
import SearchBar from "@/components/search-bar";
import { useRouterStuff } from "@/hooks/use-router-stuff";
import { capitalizeText } from "@/lib/utils";
import TaskForm from "./components/task-form";

const TasksLayout = ({ children }: { children: React.ReactNode }) => {
  const { queryParams, searchParamsObj } = useRouterStuff();

  return (
    <>
      <div className="flex flex-col sm:flex-row md:col-span-3 mb-6">
        <div className="space-y-1">
          <CardTitle>Taks</CardTitle>
          <CardDescription className="leading-non">
            View and manage tasks
          </CardDescription>
        </div>
        <div className="sm:ml-auto mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
          <TaskForm>
            <Button className="min-w-48">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </TaskForm>
        </div>
      </div>
      <div className="flex flex-col md:flex-row mb-6 justify-end gap-2">
        <SearchBar containerClassName="flex-1 md:order-1 w-[18rem]" />
      </div>
      {children}
    </>
  );
};

export default TasksLayout;
