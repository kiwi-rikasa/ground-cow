import * as React from "react";
import { ZoneSummaryCards } from "./ZoneSummaryCards";
import { ZoneEventTrendChart } from "./ZoneEventTrendChart";
import { ZoneHistograms } from "./ZoneHistograms";
import { ZoneFilter } from "./ZoneFilter";

const zoneOptions = [
  { id: "all", label: "全部廠區" },
  { id: 1, label: "北廠" },
  { id: 2, label: "南倉" },
  { id: 3, label: "東辦" },
];
const rangeOptions = [
  { value: "7d", label: "最近 7 天" },
  { value: "30d", label: "最近 30 天" },
  { value: "90d", label: "最近 90 天" },
];

export function ZoneView() {
  const [selectedZone, setSelectedZone] = React.useState<string>("all");
  const [selectedRange, setSelectedRange] = React.useState<string>("30d");

  return (
    <>
      <ZoneFilter
        zoneOptions={zoneOptions}
        rangeOptions={rangeOptions}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />
      <ZoneSummaryCards />
      <ZoneEventTrendChart />
      <ZoneHistograms />
    </>
  );
}
