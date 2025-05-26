"use client";
import { AlertDataTable } from "@/components/table/alert-data-table";
import { Suspense, useEffect, useState } from "react";

import { AlertPublic, listAlertsAlertGet } from "@/app/client";

export default function Page() {
  const [alerts, setAlerts] = useState<AlertPublic[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      const { data: alerts } = await listAlertsAlertGet({
        credentials: "include",
      });
      if (alerts) {
        setAlerts(alerts?.data);
      }
    }
    fetchAlerts();
  }, []);

  const transformedData = alerts?.map((item) => ({
    ...item,
    alert_created_at: item.alert_created_at,
    alert_alert_time: item.alert_alert_time,
    alert_state: item.alert_state as "active" | "resolved" | "closed",
    alert_is_suppressed_by: item.alert_is_suppressed_by ?? null,
  }));

  return (
    <>
      <Suspense fallback={<div>Loading auth...</div>}>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <AlertDataTable data={transformedData} setData={setAlerts} />
        </div>
      </Suspense>
    </>
  );
}
