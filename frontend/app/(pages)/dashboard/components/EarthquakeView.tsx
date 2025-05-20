import * as React from "react";
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
import type {
  EventPublic,
  EarthquakePublic,
  AlertPublic,
} from "@/app/client/types.gen";

interface EarthquakeViewProps {
  events: EventPublic[];
  earthquakes: EarthquakePublic[];
  alerts: AlertPublic[];
}

const earthquakeChartConfig = {
  magnitude: {
    label: "Magnitude",
    color: "hsl(var(--chart-1))",
  },
};

export function EarthquakeView({
  events,
  earthquakes,
  alerts,
}: EarthquakeViewProps) {
  const [selectedEarthquake, setSelectedEarthquake] = React.useState<
    number | undefined
  >(undefined);

  const filteredEvents = events.filter((event) => {
    if (selectedEarthquake && event.earthquake_id !== selectedEarthquake)
      return false;
    return true;
  });

  const filteredEarthquakes = React.useMemo(() => {
    return earthquakes
      .filter((eq) => {
        if (selectedEarthquake && eq.earthquake_id !== selectedEarthquake)
          return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.earthquake_occurred_at).getTime() -
          new Date(b.earthquake_occurred_at).getTime()
      );
  }, [earthquakes, selectedEarthquake]);

  const earthquakeMagnitudeChartData = React.useMemo(() => {
    return filteredEarthquakes.map((eq) => ({
      date: eq.earthquake_occurred_at,
      displayDate: new Date(eq.earthquake_occurred_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      ),
      magnitude: eq.earthquake_magnitude,
      id: eq.earthquake_id,
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

  const getAlertInfo = (eventId: number) => {
    const alert = alerts.find((a) => a.event_id === eventId);
    if (!alert) return { status: "N/A", duration: "N/A" };
    const alertTime = new Date(alert.alert_alert_time).getTime();
    const now = new Date().getTime();
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

  return (
    <div className="grid flex-1 auto-rows-max gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Filter by Earthquake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="earthquake-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Earthquake
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

      <div className="md:col-span-2 lg:col-span-2 xl:col-span-3">
        <Card>
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Earthquake Magnitudes Over Time</CardTitle>
              <CardDescription>
                Bar chart showing earthquake magnitudes.
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
                No earthquake data to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Events by Earthquake</CardTitle>
            <CardDescription>
              Detailed list of seismic events filtered by earthquake.
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
                          <TableCell>{alertInfo.status}</TableCell>
                          <TableCell>{alertInfo.duration}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No events found for the selected earthquake.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
