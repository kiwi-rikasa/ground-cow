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
import { DashboardTabs } from "./components/DashboardTabs";

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
      <DashboardTabs
      // events={events}
      // earthquakes={earthquakes}
      // alerts={alerts}
      />
    </div>
  );
}
