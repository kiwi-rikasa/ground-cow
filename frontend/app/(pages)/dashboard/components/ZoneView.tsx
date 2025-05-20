import * as React from "react";
import { ZoneSummaryCards } from "./ZoneSummaryCards";
import { ZoneEventTrendChart } from "./ZoneEventTrendChart";
import { ZoneHistograms } from "./ZoneHistograms";
import { ZoneFilter } from "./ZoneFilter";
import { rangeOptions } from "../utils";
import { useEffect } from "react";
import { listZonesZoneGet } from "@/app/client";
import {
  mockStats,
  mockEventTrend,
  mockMagnitudeData,
  mockIntensityData,
} from "../mock/mock-zone-data";

export function ZoneView() {
  const [selectedZone, setSelectedZone] = React.useState<string>("all");
  const [selectedRange, setSelectedRange] = React.useState<number>(
    rangeOptions[rangeOptions.length - 1].value
  );
  const [zoneOptions, setZoneOptions] = React.useState<
    {
      id: string | number;
      label: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await listZonesZoneGet();
      if (res.data) {
        setZoneOptions([
          { id: "all", label: "全部廠區" },
          ...res.data.data.map((z) => ({
            id: z.zone_id,
            label: z.zone_name ?? "",
          })),
        ]);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <ZoneFilter
        zoneOptions={zoneOptions}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />
      <ZoneSummaryCards stats={mockStats} />
      <ZoneEventTrendChart data={mockEventTrend} />
      <ZoneHistograms
        magnitudeData={mockMagnitudeData}
        intensityData={mockIntensityData}
      />
    </>
  );
}
