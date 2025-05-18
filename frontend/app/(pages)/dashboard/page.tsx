"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { BarChart, Bar } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  EventPublic,
  EarthquakePublic,
  ZonePublic,
  AlertPublic,
  EventSeverity,
  AlertState,
} from "@/app/client/types.gen";
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
import sampleDataJson from "./sampleData.json"; // Import data from JSON file

// Type assertion for the imported JSON data
const typedSampleData = {
  mockEvents: sampleDataJson.mockEvents.map((event) => ({
    ...event,
    event_severity: event.event_severity as EventSeverity,
  })) as EventPublic[],
  mockEarthquakes: sampleDataJson.mockEarthquakes as EarthquakePublic[],
  mockZones: sampleDataJson.mockZones as ZonePublic[],
  mockAlerts: sampleDataJson.mockAlerts.map((alert) => ({
    ...alert,
    alert_state: alert.alert_state as AlertState,
  })) as AlertPublic[],
};

const earthquakeChartConfig = {
  magnitude: {
    label: "Magnitude",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

// Define a color palette for zones
const zoneColors: { [key: string]: string } = {
  "1": "hsl(var(--chart-1))", // North Factory
  "2": "hsl(var(--chart-2))", // South Warehouse
  "3": "hsl(var(--chart-3))", // East Wing Office
  // Add more colors if there are more zones or a dynamic assignment strategy
};

function ActiveAlertsTrendChart({
  alerts,
  zones,
}: {
  alerts: AlertPublic[];
  zones: ZonePublic[];
}) {
  const [timeRange, setTimeRange] = React.useState("30d");

  const activeAlertsTrendData = React.useMemo(() => {
    const now = new Date();
    const initialStartDate = new Date(); // Changed to const
    if (timeRange === "30d") {
      initialStartDate.setDate(now.getDate() - 30);
    } else if (timeRange === "7d") {
      initialStartDate.setDate(now.getDate() - 7);
    } else if (timeRange === "90d") {
      initialStartDate.setDate(now.getDate() - 90);
    }
    const startDate = initialStartDate; // Use the modified date

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
              minTickGap={16} // Adjust based on data density
              tickFormatter={(value) => {
                const date = new Date(value);
                // Add a day to correct for potential timezone issues in display
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
                    date.setDate(date.getDate() + 1); // Adjust for display
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

export default function Page() {
  const [selectedZone, setSelectedZone] = React.useState<number | undefined>(
    undefined
  );
  const [selectedEarthquake, setSelectedEarthquake] = React.useState<
    number | undefined
  >(undefined);

  // Use data from the imported JSON file
  const [events] = React.useState<EventPublic[]>(typedSampleData.mockEvents);
  const [earthquakes] = React.useState<EarthquakePublic[]>(
    typedSampleData.mockEarthquakes
  );
  const [zones] = React.useState<ZonePublic[]>(typedSampleData.mockZones);
  const [alerts] = React.useState<AlertPublic[]>(typedSampleData.mockAlerts);

  // TODO: Fetch real data using API client

  const filteredEvents = events.filter((event) => {
    if (selectedZone && event.zone_id !== selectedZone) return false;
    if (selectedEarthquake && event.earthquake_id !== selectedEarthquake)
      return false;
    return true;
  });

  const getAlertInfo = (eventId: number) => {
    const alert = alerts.find((a) => a.event_id === eventId);
    if (!alert) return { status: "N/A", duration: "N/A" };
    // This is a simplified duration calculation.
    // In a real scenario, you might want to calculate duration based on resolution time if available.
    const alertTime = new Date(alert.alert_alert_time).getTime();
    const now = new Date().getTime(); // Or event resolution time
    const durationMs = now - alertTime;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60)
    );
    return {
      status: alert.alert_state,
      duration: `${durationHours}h ${durationMinutes}m`,
    };
  };

  // Filter earthquakes based on selectedZone and selectedEarthquake for the chart
  const filteredEarthquakes = React.useMemo(() => {
    return earthquakes
      .filter((eq) => {
        // If a zone is selected, find events in that zone and check if this earthquake is associated
        if (selectedZone) {
          const eventsInZone = events.filter(
            (event) => event.zone_id === selectedZone
          );
          if (
            !eventsInZone.some(
              (event) => event.earthquake_id === eq.earthquake_id
            )
          ) {
            return false;
          }
        }
        // If a specific earthquake is selected, only show that one
        if (selectedEarthquake && eq.earthquake_id !== selectedEarthquake) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.earthquake_occurred_at).getTime() -
          new Date(b.earthquake_occurred_at).getTime()
      );
  }, [earthquakes, events, selectedZone, selectedEarthquake]);

  const earthquakeMagnitudeChartData = React.useMemo(() => {
    return filteredEarthquakes.map((eq) => ({
      date: eq.earthquake_occurred_at, // Keep original date for tooltip labelFormatter
      displayDate: new Date(eq.earthquake_occurred_at).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      ),
      magnitude: eq.earthquake_magnitude,
      id: eq.earthquake_id, // Keep for potential future use or more detailed tooltips
    }));
  }, [filteredEarthquakes]);

  const earthquakeSummary = React.useMemo(() => {
    return {
      total: filteredEarthquakes.length,
      averageMagnitude:
        filteredEarthquakes.length > 0
          ? (
              filteredEarthquakes.reduce(
                (acc, curr) => acc + curr.earthquake_magnitude,
                0
              ) / filteredEarthquakes.length
            ).toFixed(1)
          : "N/A",
    };
  }, [filteredEarthquakes]);

  return (
    <div className="grid flex-1 auto-rows-max gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="zone-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Zone
              </label>
              <Select
                onValueChange={(value) =>
                  setSelectedZone(value === "all" ? undefined : Number(value))
                }
              >
                <SelectTrigger id="zone-filter">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.zone_id} value={String(zone.zone_id)}>
                      {zone.zone_name} (ID: {zone.zone_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="earthquake-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Earthquake
              </label>
              <Select
                onValueChange={(value) =>
                  setSelectedEarthquake(
                    value === "all" ? undefined : Number(value)
                  )
                }
              >
                <SelectTrigger id="earthquake-filter">
                  <SelectValue placeholder="Select Earthquake" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Earthquakes</SelectItem>
                  {earthquakes.map((eq) => (
                    <SelectItem
                      key={eq.earthquake_id}
                      value={String(eq.earthquake_id)}
                    >
                      EQ ID: {eq.earthquake_id} (Mag: {eq.earthquake_magnitude})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts Trend Chart - Spanning more columns on larger screens */}
      <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
        <ActiveAlertsTrendChart alerts={alerts} zones={zones} />
      </div>

      {/* Events Table - Spanning more columns */}
      <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              Detailed list of seismic events and their alert statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Intensity</TableHead>
                    <TableHead>Earthquake ID</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Alert Status</TableHead>
                    <TableHead>Alert Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const alertInfo = getAlertInfo(event.event_id);
                      return (
                        <TableRow key={event.event_id}>
                          <TableCell>{event.event_id}</TableCell>
                          <TableCell>{event.event_severity}</TableCell>
                          <TableCell>{event.event_intensity}</TableCell>
                          <TableCell>{event.earthquake_id}</TableCell>
                          <TableCell>{event.zone?.zone_name}</TableCell>
                          <TableCell>{alertInfo.status}</TableCell>
                          <TableCell>{alertInfo.duration}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No events found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earthquake Magnitudes Chart - Spanning more columns */}
      <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Earthquake Magnitudes Over Time</CardTitle>
              <CardDescription>
                Bar chart showing earthquake magnitudes. Filter by zone or
                specific earthquake above.
              </CardDescription>
            </div>
            <div className="flex">
              <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                <span className="text-xs text-muted-foreground">
                  Total Recorded
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {earthquakeSummary.total}
                </span>
              </div>
              <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Avg. Magnitude
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {earthquakeSummary.averageMagnitude}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {earthquakeMagnitudeChartData.length > 0 ? (
              <ChartContainer
                config={earthquakeChartConfig}
                className="aspect-auto h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={earthquakeMagnitudeChartData}
                  margin={{ top: 5, left: 0, right: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    dataKey="magnitude"
                    tickMargin={8}
                    domain={[0, "dataMax + 1"]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value, payload) => {
                          if (
                            payload &&
                            payload.length > 0 &&
                            payload[0].payload.date
                          ) {
                            return new Date(
                              payload[0].payload.date
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          }
                          return value;
                        }}
                        formatter={(value) => `${value} Richter`}
                        indicator="line"
                      />
                    }
                  />
                  <Bar
                    dataKey="magnitude"
                    fill="var(--color-magnitude)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No earthquake data to display based on current filters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
