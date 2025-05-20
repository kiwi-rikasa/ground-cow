import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AlertPublic, ZonePublic } from "@/app/client/types.gen";

// Define a color palette for zones
const zoneColors: { [key: string]: string } = {
  "1": "hsl(var(--chart-1))", // North Factory
  "2": "hsl(var(--chart-2))", // South Warehouse
  "3": "hsl(var(--chart-3))", // East Wing Office
};

interface ActiveAlertsTrendChartProps {
  alerts: AlertPublic[];
  zones: ZonePublic[];
}

export function ActiveAlertsTrendChart({
  alerts,
  zones,
}: ActiveAlertsTrendChartProps) {
  const [timeRange, setTimeRange] = React.useState("30d");

  const activeAlertsTrendData = React.useMemo(() => {
    const now = new Date();
    const initialStartDate = new Date();
    if (timeRange === "30d") {
      initialStartDate.setDate(now.getDate() - 30);
    } else if (timeRange === "7d") {
      initialStartDate.setDate(now.getDate() - 7);
    } else if (timeRange === "90d") {
      initialStartDate.setDate(now.getDate() - 90);
    }
    const startDate = initialStartDate;

    const activeAlerts = alerts.filter(
      (alert) =>
        alert.alert_state === "active" &&
        alert.alert_is_suppressed_by === null &&
        new Date(alert.alert_alert_time) >= startDate
    );

    // Group by date (YYYY-MM-DD) and then by zone_id
    const groupedByDateAndZone = activeAlerts.reduce((acc, alert) => {
      const alertDate = new Date(alert.alert_alert_time)
        .toISOString()
        .split("T")[0];
      acc[alertDate] = acc[alertDate] || {};
      acc[alertDate][alert.zone_id] = (acc[alertDate][alert.zone_id] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<number, number>>);

    // Transform into chart data format, ensuring all zones are present for each date
    const allZoneIds = zones.map((z) => z.zone_id);

    type ChartEntry = { date: string; [key: string]: number | string };

    const chartData = Object.entries(groupedByDateAndZone).map(
      ([date, zoneCounts]) => {
        const entry: ChartEntry = { date };
        allZoneIds.forEach((zoneId) => {
          entry[`zone_${zoneId}`] = zoneCounts[zoneId] || 0;
        });
        return entry;
      }
    );

    return chartData;
  }, [alerts, zones, timeRange]);

  const activeAlertsChartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    zones.forEach((zone) => {
      config[`zone_${zone.zone_id}`] = {
        label: zone.zone_name || `Zone ${zone.zone_id}`,
        color: zoneColors[String(zone.zone_id)] || "hsl(var(--chart-5))", // Fallback color
      };
    });
    return config;
  }, [zones]);

  if (activeAlertsTrendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts Trend per Zone</CardTitle>
          <CardDescription>
            Shows the trend of active (unsuppressed) alerts per zone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No active alert data to display for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Active Alerts Trend per Zone</CardTitle>
          <CardDescription>
            Shows the trend of active (unsuppressed) alerts per zone.
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 90 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={activeAlertsChartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart
            data={activeAlertsTrendData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              {Object.keys(activeAlertsChartConfig).map((key) => (
                <linearGradient
                  key={key}
                  id={`fill_${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              tickFormatter={(value) => {
                const date = new Date(value);
                date.setDate(date.getDate() + 1);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    date.setDate(date.getDate() + 1);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            {Object.keys(activeAlertsChartConfig).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill_${key})`}
                stroke={`var(--color-${key})`}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
