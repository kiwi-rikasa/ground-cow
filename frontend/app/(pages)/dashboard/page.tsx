"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ZoneView } from "./views/ZoneView";
import { EarthquakeView } from "./views/EarthquakeView";
import { useSession } from "next-auth/react";

export default function Page() {
  const { status } = useSession();

  if (status === "loading" || status === "unauthenticated") {
    return;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Card className="p-0 bg-background/80 rounded-none shadow-none">
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
