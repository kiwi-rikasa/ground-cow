"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { AlertDataTable } from "@/components/alert-data-table";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { AlertPublic, listAlertsAlertGet } from "./client";
import { Skeleton } from "@/components/ui/skeleton";
export default function Page() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<AlertPublic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchAlerts() {
      const { data: alerts } = await listAlertsAlertGet();
      if (alerts) {
        setAlerts(alerts?.data);
      }
    }
    fetchAlerts();
  }, []);

  const transformedData = alerts?.map((item) => ({
    ...item,
    alert_created_at: new Date(item.alert_created_at),
    alert_alert_time: new Date(item.alert_alert_time),
    alert_state: item.alert_state as "active" | "resolved" | "closed",
    alert_is_suppressed_by: item.alert_is_suppressed_by ?? null,
  }));

  if (status === "loading" || !transformedData) {
    return <Skeleton className="h-svh" />;
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
            {session?.user && transformedData ? (
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <AlertDataTable data={transformedData} />
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
