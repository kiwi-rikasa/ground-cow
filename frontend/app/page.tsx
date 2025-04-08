"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthDialog from "@/components/auth-dialog";
import { useSession } from "next-auth/react";

import data from "./data.json";

export default function Page() {
  const { data: session } = useSession();
  const transformedData = data.map((item) => ({
    ...item,
    occurredTime: new Date(item.occurredTime),
    lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : null,
  }));

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
          <AuthDialog />
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
