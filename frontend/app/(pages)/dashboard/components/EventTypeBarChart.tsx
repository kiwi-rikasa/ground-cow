import { ChartTooltip } from "@/components/ui/chart";

import { ChartTooltipContent } from "@/components/ui/chart";

import { Bar, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart } from "recharts";
import { EarthquakeDashboardResponse } from "@/app/client";
const barConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

export function EventTypeBarChart({
  earthquake_event_type,
}: {
  earthquake_event_type: EarthquakeDashboardResponse["earthquake_event_type"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>事件類型分佈</CardTitle>
        <CardDescription>L1/L2 事件數量</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barConfig} className="h-[220px] w-full">
          <BarChart
            data={earthquake_event_type}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              dataKey="count"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill={barConfig.count.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
