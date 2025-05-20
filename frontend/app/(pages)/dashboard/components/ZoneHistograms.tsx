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

interface ZoneHistogramData {
  bin: string;
  count: number;
}

interface ZoneHistogramsProps {
  magnitudeData: ZoneHistogramData[];
  intensityData: ZoneHistogramData[];
}

const barConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

export function ZoneHistograms({
  magnitudeData,
  intensityData,
}: ZoneHistogramsProps) {
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
