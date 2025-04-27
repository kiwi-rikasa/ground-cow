"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Suspense, useEffect } from "react";
import { listReportsReportGet } from "@/app/client/sdk.gen";

export default function Page() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchReports = async () => {
      const { data: reports } = await listReportsReportGet();
      console.log("reports", reports);
    };
    fetchReports();
  }, []);

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
          <div className="@container/main flex flex-1 flex-col gap-2 items-center justify-center">
            <h1>Reports</h1>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
