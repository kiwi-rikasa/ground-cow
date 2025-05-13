"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/event-data-table";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { EventPublic, listEventsEventGet } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<EventPublic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchEvents() {
      const { data: events } = await listEventsEventGet();
      if (events) {
        setEvents(events?.data);
      }
    }
    fetchEvents();
  }, []);

  const transformedData =
    events?.map((item) => ({
      ...item,
      event_created_at: new Date(item.event_created_at),
      event_severity: item.event_severity || "",
      zone_id: item.zone_id || null,
      earthquake_id: item.earthquake_id || null,
    })) || [];

  if (status === "loading") {
    return;
  }

  if (!session) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Suspense fallback={<div>Loading auth...</div>}></Suspense>
          <div className="@container/main flex flex-1 flex-col gap-2">
            {session?.user ? (
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <DataTable data={transformedData} />
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
