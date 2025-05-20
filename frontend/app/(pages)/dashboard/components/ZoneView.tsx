import * as React from "react";
import { ZoneSummaryCards } from "./ZoneSummaryCards";
import { ZoneEventTrendChart } from "./ZoneEventTrendChart";
import { ZoneHistograms } from "./ZoneHistograms";
import { ZoneFilter } from "./ZoneFilter";
import { rangeOptions } from "../utils";

const zoneOptions = [
  { id: "all", label: "全部廠區" },
  { id: 1, label: "北廠" },
  { id: 2, label: "南倉" },
  { id: 3, label: "東辦" },
];

export function ZoneView() {
  const [selectedZone, setSelectedZone] = React.useState<string>("all");
  const [selectedRange, setSelectedRange] = React.useState<number>(
    rangeOptions[rangeOptions.length - 1].value
  );

  return (
    <>
      <ZoneFilter
        zoneOptions={zoneOptions}
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
