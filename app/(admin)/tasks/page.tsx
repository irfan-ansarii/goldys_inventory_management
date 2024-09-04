import React from "react";
import TaskCard from "./components/task-card";
import Pagination from "@/components/pagination";
import { getTasks } from "@/query/tasks";
import NoDataFallback from "@/components/nodata-fallback";

const TaskPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { data, meta } = await getTasks(searchParams);
  return (
    <>
      <div className="grid gap-3 content-start flex-1">
        {data.length === 0 && <NoDataFallback className="h-96" />}
        {data.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      <Pagination meta={meta} />
    </>
  );
};

export default TaskPage;
