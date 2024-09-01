import React from "react";
import { CHART_COLORS } from "@/lib/utils";
import { getEmployeesOverview } from "@/query/dashboard";
import EmployeeChart from "./charts/employee";
import EmptyState from "./empty-state";

const Employee = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { interval = "today" } = searchParams;
  const { data } = await getEmployeesOverview(interval);

  const chartData = data.map((emp, i) => ({
    name: emp.name,
    total: parseFloat(emp.total || "0"),
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <>
      <EmployeeChart chartData={chartData} />

      {(!data || data.length === 0) && <EmptyState />}
    </>
  );
};

export default Employee;
