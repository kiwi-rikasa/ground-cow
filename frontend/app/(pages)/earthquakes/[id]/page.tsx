"use client";

import * as React from "react";
import {
  EarthquakeDashboardResponse,
  getEarthquakeDashboardDashboardEarthquakeGet,
} from "@/app/client";
import { useEffect } from "react";
import { EarthquakeSummaryCards } from "@/app/(pages)/dashboard/components/EarthquakeSummaryCards";
import { EventTypeBarChart } from "@/app/(pages)/dashboard/components/EventTypeBarChart";
import { EarthquakeProgressTable } from "@/app/(pages)/dashboard/components/EarthquakeProgressTable";
import { useParams } from "next/navigation";

export default function EarthquakeDetail() {
  const earthquakeId = useParams().id;
  const [earthquakeData, setEarthquakeData] =
    React.useState<EarthquakeDashboardResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getEarthquakeDashboardDashboardEarthquakeGet({
        query: {
          earthquake_id: Number(earthquakeId),
          weeks: -1,
        },
      });
      if (res.data) {
        setEarthquakeData(res.data);
      }
    };
    fetchData();
  }, [earthquakeId]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      {earthquakeData && (
        <>
          <h1 className="text-2xl font-bold">Earthquake #{earthquakeId}</h1>
          <EarthquakeSummaryCards earthquakeData={earthquakeData} />
          <EventTypeBarChart
            earthquake_event_type={earthquakeData.earthquake_event_type}
          />
          <EarthquakeProgressTable
            earthquakeProgress={earthquakeData.earthquake_progress}
          />
        </>
      )}
    </div>
  );
}
