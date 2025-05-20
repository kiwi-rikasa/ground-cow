import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface DashboardTabsProps {
  // events: EventPublic[];
  // earthquakes: EarthquakePublic[];
  // alerts: AlertPublic[];
  zoneView: React.ReactNode;
  earthquakeView: React.ReactNode;
  earthquakesView: React.ReactNode;
}

export function DashboardTabs({
  zoneView,
  earthquakeView,
  earthquakesView,
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
              地震詳細資料
            </TabsTrigger>
            <TabsTrigger
              value="earthquakes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6 py-2 text-base font-medium transition-colors"
            >
              地震總覽
            </TabsTrigger>
          </TabsList>
          <div className="pb-2 px-1 sm:px-2">
            <TabsContent value="zone">{zoneView}</TabsContent>
            <TabsContent value="earthquake">{earthquakeView}</TabsContent>
            <TabsContent value="earthquakes">{earthquakesView}</TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}
