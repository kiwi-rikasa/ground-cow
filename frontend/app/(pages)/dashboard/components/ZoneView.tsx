import * as React from "react";
import { ZoneSummaryCards } from "./ZoneSummaryCards";
import { ZoneEventTrendChart } from "./ZoneEventTrendChart";
import { ZoneHistograms } from "./ZoneHistograms";

export function ZoneView() {
  return (
    <>
      <ZoneSummaryCards />
      <ZoneEventTrendChart />
      <ZoneHistograms />
    </>
  );
}
