import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const magnitudeData = [
  { bin: "3.0-3.9", count: 2 },
  { bin: "4.0-4.9", count: 5 },
  { bin: "5.0-5.9", count: 8 },
  { bin: "6.0-6.9", count: 3 },
  { bin: "7.0-7.9", count: 1 },
];
const intensityData = [
  { bin: "I-II", count: 1 },
  { bin: "III-IV", count: 4 },
  { bin: "V-VI", count: 7 },
  { bin: "VII-VIII", count: 5 },
  { bin: "IX+", count: 2 },
];
const barConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

export function ZoneHistograms() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>地震規模分佈</CardTitle>
          <CardDescription>地震規模的直方圖分佈</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[250px] w-full">
            <BarChart data={magnitudeData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bin"
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
      <Card>
        <CardHeader>
          <CardTitle>地震震度分佈</CardTitle>
          <CardDescription>地震震度的直方圖分佈</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[250px] w-full">
            <BarChart data={intensityData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="bin"
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
    </div>
  );
}
