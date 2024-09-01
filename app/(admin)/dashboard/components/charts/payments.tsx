"use client";

import * as React from "react";

import { Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  purchase: {
    label: "Purchase",
  },
  sale: {
    label: "Sale",
  },
} satisfies ChartConfig;

interface DataType {
  saleData: Record<string, string | number | null>[];
  purchaseData: Record<string, string | number | null>[];
}
export default function Component({ saleData, purchaseData }: DataType) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="name"
              indicator="line"
              asNumber
              labelFormatter={(_, payload) => {
                return chartConfig[
                  payload?.[0].dataKey as keyof typeof chartConfig
                ].label;
              }}
            />
          }
        />
        <Pie data={purchaseData} dataKey="purchase" outerRadius={60} />
        <Pie
          data={saleData}
          dataKey="sale"
          innerRadius={80}
          outerRadius={120}
        />
      </PieChart>
    </ChartContainer>
  );
}
