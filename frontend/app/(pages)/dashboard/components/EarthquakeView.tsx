import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EarthquakeDetailFilter } from "./EarthquakeDetailFilter";
import { EarthquakeOverviewFilter } from "./EarthquakeOverviewFilter";
import { rangeOptions } from "../utils";

// Mock earthquake list
const earthquakeList = [
  { id: 1, label: "2024-06-20 14:32 (M6.2)" },
  { id: 2, label: "2024-06-18 09:10 (M5.8)" },
  { id: 3, label: "2024-06-15 22:45 (M4.9)" },
];

type SummaryType = {
  發生時間: string;
  規模: string;
  範圍區平均震度: string;
  "alert 完成 %": string;
  "啟動戰情 %": string;
  "有損傷 %": string;
};

// Mock data for summary cards by earthquake id
const summaryMap: Record<string, SummaryType> = {
  "1": {
    發生時間: "2024-06-20 14:32",
    規模: "6.2",
    範圍區平均震度: "V",
    "alert 完成 %": "92%",
    "啟動戰情 %": "80%",
    "有損傷 %": "15%",
  },
  "2": {
    發生時間: "2024-06-18 09:10",
    規模: "5.8",
    範圍區平均震度: "IV",
    "alert 完成 %": "88%",
    "啟動戰情 %": "70%",
    "有損傷 %": "10%",
  },
  "3": {
    發生時間: "2024-06-15 22:45",
    規模: "4.9",
    範圍區平均震度: "III",
    "alert 完成 %": "95%",
    "啟動戰情 %": "60%",
    "有損傷 %": "5%",
  },
};

// Mock data for event type bar chart
const eventTypeData = [
  { type: "L1", count: 12 },
  { type: "L2", count: 6 },
];
const barConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

// Mock data for table
const progressData = [
  { zone: "北廠", severity: "high", state: "active" },
  { zone: "南倉", severity: "medium", state: "completed" },
  { zone: "東辦", severity: "low", state: "suppressed" },
];

export function EarthquakeView({
  isEarthquakeOverview = true,
}: {
  isEarthquakeOverview?: boolean;
}) {
  const [selectedEq, setSelectedEq] = React.useState(earthquakeList[0].id);
  const [selectedRange, setSelectedRange] = React.useState(
    rangeOptions[rangeOptions.length - 1].value
  );
  const summary = summaryMap[String(selectedEq)];

  return (
    <div className="flex flex-col gap-6">
      {/* Filter */}
      {isEarthquakeOverview ? (
        <EarthquakeOverviewFilter
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
      ) : (
        <EarthquakeDetailFilter
          earthquakeList={earthquakeList}
          selectedEq={selectedEq}
          setSelectedEq={setSelectedEq}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-6 sm:grid-rows-3 lg:grid-rows-2 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>發生時間</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["發生時間"]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>規模</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["規模"]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>範圍區平均震度</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["範圍區平均震度"]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>alert 完成 %</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["alert 完成 %"]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>啟動戰情 %</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["啟動戰情 %"]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>有損傷 %</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary["有損傷 %"]}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Event Type Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>事件類型分佈</CardTitle>
          <CardDescription>L1/L2 事件數量</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="h-[220px] w-full">
            <BarChart data={eventTypeData} margin={{ left: 12, right: 12 }}>
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

      {/* Progress Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>各廠區回報進度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>zone</TableHead>
                  <TableHead>event severity</TableHead>
                  <TableHead>alert state</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressData.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.zone}</TableCell>
                    <TableCell>{row.severity}</TableCell>
                    <TableCell>{row.state}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
