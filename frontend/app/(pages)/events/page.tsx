"use client";
import { EventDataTable } from "@/components/table/event-data-table";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { EventPublic, listEventsEventGet, EventSeverity } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<EventPublic[]>([]);

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
      event_severity: item.event_severity || ("N/A" as EventSeverity),
      zone_id: item.zone_id || 0,
      earthquake_id: item.earthquake_id || 0,
    })) || [];

  if (status === "loading" || status === "unauthenticated") {
    return;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div>Loading auth...</div>}></Suspense>
      <div className="@container/main flex flex-1 flex-col gap-2">
        {session?.user ? (
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <EventDataTable data={transformedData} setData={setEvents} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
