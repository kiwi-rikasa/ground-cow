"use client";

import * as React from "react";
// import type {
//   EventPublic,
//   EarthquakePublic,
//   ZonePublic,
//   AlertPublic,
//   EventSeverity,
//   AlertState,
// } from "@/app/client/types.gen";
// import sampleDataJson from "./sampleData.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ZoneView } from "./components/ZoneView";
import { EarthquakeView } from "./components/EarthquakeView";
// Type assertion for the imported JSON data
// const typedSampleData = {
//   mockEvents: sampleDataJson.mockEvents.map((event) => ({
//     ...event,
//     event_severity: event.event_severity as EventSeverity,
//   })) as EventPublic[],
//   mockEarthquakes: sampleDataJson.mockEarthquakes as EarthquakePublic[],
//   mockZones: sampleDataJson.mockZones as ZonePublic[],
//   mockAlerts: sampleDataJson.mockAlerts.map((alert) => ({
//     ...alert,
//     alert_state: alert.alert_state as AlertState,
//   })) as AlertPublic[],
// };

export default function Page() {
  // Use data from the imported JSON file
  // const [events] = React.useState<EventPublic[]>(typedSampleData.mockEvents);
  // const [earthquakes] = React.useState<EarthquakePublic[]>(
  //   typedSampleData.mockEarthquakes
  // );
  // const [zones] = React.useState<ZonePublic[]>(typedSampleData.mockZones);
  // const [alerts] = React.useState<AlertPublic[]>(typedSampleData.mockAlerts);

  return (
    <div className="container mx-auto">
      <Card className="p-0 shadow-lg bg-background/80">
        <div className="px-4 pt-4 pb-0 sm:px-8">
          <Tabs defaultValue="zone" className="w-full">
            <TabsList className="mb-4 flex w-full justify-center gap-2 rounded-xl bg-muted/60 p-1 shadow-inner">
              <TabsTrigger
                value="zone"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2 text-base font-medium transition-colors"
              >
                廠區視圖
              </TabsTrigger>
              <TabsTrigger
                value="earthquakeOverview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2 text-base font-medium transition-colors"
              >
                地震總覽
              </TabsTrigger>
              <TabsTrigger
                value="earthquakeDetail"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2 text-base font-medium transition-colors"
              >
                地震詳細資料
              </TabsTrigger>
            </TabsList>
            <div className="pb-2 px-1 sm:px-2">
              <TabsContent value="zone">
                <ZoneView />
              </TabsContent>
              <TabsContent value="earthquakeOverview">
                <EarthquakeView isEarthquakeOverview />
              </TabsContent>
              <TabsContent value="earthquakeDetail">
                <EarthquakeView isEarthquakeOverview={false} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
