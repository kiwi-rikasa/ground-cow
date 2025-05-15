"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { ReportDataTable } from "@/components/report-data-table";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { listReportsReportGet, ReportPublic } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<ReportPublic[] | undefined>(undefined);

  useEffect(() => {
    async function fetchReports() {
      const { data: reports } = await listReportsReportGet();
      if (reports) {
        setReports(reports?.data);
      }
    }

    fetchReports();
  }, [reports]);

  const transformedData = reports;

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
                <ReportDataTable data={transformedData || []} />
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
