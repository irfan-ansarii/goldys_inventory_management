"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/utils";

const chartConfig = {
  sale: {
    label: "Sale",
    color: CHART_COLORS[0],
  },
  purchase: {
    label: "Purchase",
    color: CHART_COLORS[1],
  },
} satisfies ChartConfig;

export default function OverviewChart({
  chartData,
}: {
  chartData: { name: string; sale: string | null; purchase: string | null }[];
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
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" asNumber />}
        />
        <Bar dataKey="sale" fill="var(--color-sale)" radius={4} />
        <Bar dataKey="purchase" fill="var(--color-purchase)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
