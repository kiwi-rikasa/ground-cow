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
import {
  mockEarthquakeList,
  mockSummaryMap,
  mockEventTypeData,
  mockProgressData,
} from "../mock/mock-eq-data";

const barConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
};

const translations = {
  occurrenceTime: "發生時間",
  magnitude: "規模",
  averageIntensity: "範圍區平均震度",
  alertCompletionRate: "alert 完成 %",
  alertActivationRate: "啟動戰情 %",
  damageRate: "有損傷 %",
};

export function EarthquakeView({
  isEarthquakeOverview = true,
}: {
  isEarthquakeOverview?: boolean;
}) {
  const [selectedEq, setSelectedEq] = React.useState(mockEarthquakeList[0].id);
  const [selectedRange, setSelectedRange] = React.useState(
    rangeOptions[rangeOptions.length - 1].value
  );
  const summary = mockSummaryMap[String(selectedEq)];

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
          earthquakeList={mockEarthquakeList}
          selectedEq={selectedEq}
          setSelectedEq={setSelectedEq}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-6 sm:grid-rows-3 lg:grid-rows-2 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>{translations.occurrenceTime}</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.occurrenceTime}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{translations.magnitude}</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.magnitude}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{translations.averageIntensity}</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.averageIntensity}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              {translations.alertCompletionRate}
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.alertCompletionRate}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              {translations.alertActivationRate}
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.alertActivationRate}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{translations.damageRate}</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums">
              {summary.damageRate}
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
            <BarChart data={mockEventTypeData} margin={{ left: 12, right: 12 }}>
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
                {mockProgressData.map((row, i) => (
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
