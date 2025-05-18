"use client";
import { ReportDataTable } from "@/components/report-data-table";
import { LoginForm } from "@/components/login-form";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState, useRef } from "react";

import { listReportsReportGet, ReportPublic } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<ReportPublic[]>([]);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    async function fetchReports() {
      if (dataFetchedRef.current) return;
      const { data: reports } = await listReportsReportGet();
      if (reports) {
        setReports(reports?.data);
        dataFetchedRef.current = true;
      }
    }

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
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div>Loading auth...</div>}></Suspense>
      <div className="@container/main flex flex-1 flex-col gap-2">
        {session?.user ? (
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <ReportDataTable data={reports || []} setData={setReports} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
