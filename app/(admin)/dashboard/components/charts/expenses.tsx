"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  total: { label: "Total" },
} satisfies ChartConfig;

export default function ExpensesChart({
  chartData,
}: {
  chartData: Record<string, string | number | null>[];
}) {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string) =>
            value.length > 5 ? value.slice(0, 5) + "..." : value
          }
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent asNumber />}
        />
        <Bar dataKey="total" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
