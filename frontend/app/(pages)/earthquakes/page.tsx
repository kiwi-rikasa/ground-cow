"use client";
import { EarthquakeDataTable } from "@/components/table/earthquake-data-table";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";

import { EarthquakePublic, listEarthquakesEarthquakeGet } from "@/app/client";

export default function Page() {
  const { data: session, status } = useSession();

  const [earthquakes, setEarthquakes] = useState<EarthquakePublic[]>([]);

  useEffect(() => {
    async function fetchEarthquakes() {
      const { data: earthquakes } = await listEarthquakesEarthquakeGet();
      if (earthquakes) {
        setEarthquakes(earthquakes?.data);
      }
    }
    fetchEarthquakes();
  }, []);

  const transformedData =
    earthquakes?.map((item) => ({
      ...item,
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
            <EarthquakeDataTable
              data={transformedData}
              setData={setEarthquakes}
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
