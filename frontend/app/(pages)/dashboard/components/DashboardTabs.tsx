import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ZoneView } from "./ZoneView";
import { EarthquakeView } from "./EarthquakeView";
import type {
  EventPublic,
  EarthquakePublic,
  AlertPublic,
} from "@/app/client/types.gen";
import { Card } from "@/components/ui/card";

interface DashboardTabsProps {
  events: EventPublic[];
  earthquakes: EarthquakePublic[];
  alerts: AlertPublic[];
}

export function DashboardTabs({
  events,
  earthquakes,
  alerts,
}: DashboardTabsProps) {
  return (
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
              value="earthquake"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2 text-base font-medium transition-colors"
            >
              地震視圖
            </TabsTrigger>
          </TabsList>
          <div className="pb-2 px-1 sm:px-2">
            <TabsContent value="zone">
              <ZoneView />
            </TabsContent>
            <TabsContent value="earthquake">
              <EarthquakeView
                events={events}
                earthquakes={earthquakes}
                alerts={alerts}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}
