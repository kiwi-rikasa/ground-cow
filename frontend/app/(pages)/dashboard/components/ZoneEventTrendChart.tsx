"use client";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ZoneEventTrend {
  date: string;
  L1: number;
  L2: number;
}

interface ZoneEventTrendChartProps {
  data: ZoneEventTrend[];
}

const chartConfig = {
  L1: {
    label: "L1",
    color: "gray",
  },
  L2: {
    label: "L2",
    color: "black",
  },
} satisfies ChartConfig;

export function ZoneEventTrendChart({ data }: ZoneEventTrendChartProps) {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Event Trend</CardTitle>
        <CardDescription>事件趨勢（依日期）</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: "date",
                position: "insideBottomRight",
                offset: -4,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{
                value: "event count",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="L1"
              type="monotone"
              stroke={chartConfig.L1.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="L2"
              type="monotone"
              stroke={chartConfig.L2.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              事件數量趨勢 <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              L1、L2 代表不同事件類型
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
