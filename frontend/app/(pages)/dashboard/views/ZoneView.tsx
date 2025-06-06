import * as React from "react";
import { ZoneSummaryCards } from "../components/ZoneSummaryCards";
import { ZoneEventTrendChart } from "../components/ZoneEventTrendChart";
import { ZoneHistograms } from "../components/ZoneHistograms";
import { ZoneFilter } from "../components/ZoneFilter";
import { rangeOptions } from "../utils";
import { useEffect, useState } from "react";
import {
  listZonesZoneGet,
  getZoneDashboardDashboardZoneZoneIdGet,
  ZoneDashboardResponse,
} from "@/app/client";

export function ZoneView() {
  const [selectedZone, setSelectedZone] = React.useState<string>("-1");
  const [selectedRange, setSelectedRange] = React.useState<number>(
    rangeOptions[rangeOptions.length - 1].value
  );
  const [zoneOptions, setZoneOptions] = React.useState<
    {
      id: string | number;
      label: string;
    }[]
  >([]);
  const [zoneData, setZoneData] = React.useState<ZoneDashboardResponse | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await listZonesZoneGet();
      if (res.data) {
        setZoneOptions([
          { id: "-1", label: "全部廠區" },
          ...res.data.data.map((z) => ({
            id: z.zone_id,
            label: z.zone_name ?? "",
          })),
        ]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getZoneDashboardDashboardZoneZoneIdGet({
        path: {
          zone_id: parseInt(selectedZone),
        },
        query: {
          weeks: selectedRange,
        },
      });
      if (res.data) {
        setZoneData(res.data);
      }
    };
    fetchData();
  }, [selectedZone, selectedRange]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div key={`zone-view-${refreshKey}`}>
      <ZoneFilter
        zoneOptions={zoneOptions}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />
      {zoneData && (
        <>
          <ZoneSummaryCards stats={zoneData.zone_stats} />
          <ZoneEventTrendChart data={zoneData.zone_event_trend} />
          <ZoneHistograms
            magnitudeData={zoneData.zone_magnitude_data}
            intensityData={zoneData.zone_intensity_data}
          />
        </>
      )}
    </div>
  );
}
