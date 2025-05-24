import * as React from "react";
import { EarthquakeDetailFilter } from "../components/EarthquakeDetailFilter";
import { EarthquakeOverviewFilter } from "../components/EarthquakeOverviewFilter";
import { rangeOptions } from "../utils";
import {
  EarthquakeDashboardResponse,
  getEarthquakeDashboardDashboardEarthquakeGet,
  listFilteredEarthquakesDashboardEarthquakeListGet,
  ListFilteredEarthquakesDashboardEarthquakeListGetResponse,
} from "@/app/client";
import { useEffect, useState } from "react";
import { EarthquakeSummaryCards } from "../components/EarthquakeSummaryCards";
import { EventTypeBarChart } from "../components/EventTypeBarChart";
import { EarthquakeProgressTable } from "../components/EarthquakeProgressTable";

export function EarthquakeView({
  isEarthquakeOverview = true,
}: {
  isEarthquakeOverview?: boolean;
}) {
  const [selectedEq, setSelectedEq] = React.useState(-1);
  const [earthquakeList, setEarthquakeList] =
    React.useState<ListFilteredEarthquakesDashboardEarthquakeListGetResponse | null>(
      null
    );
  const [selectedRange, setSelectedRange] = React.useState(
    rangeOptions[rangeOptions.length - 1].value
  );
  const [earthquakeData, setEarthquakeData] =
    React.useState<EarthquakeDashboardResponse | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshKey((prevKey) => prevKey + 1);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getEarthquakeDashboardDashboardEarthquakeGet({
        query: {
          earthquake_id: isEarthquakeOverview ? -1 : selectedEq,
          weeks: isEarthquakeOverview ? selectedRange : -1,
        },
      });
      if (res.data) {
        setEarthquakeData(res.data);
      }
    };
    fetchData();
  }, [selectedEq, selectedRange, isEarthquakeOverview]);

  useEffect(() => {
    if (!isEarthquakeOverview) {
      const fetchData = async () => {
        const res = await listFilteredEarthquakesDashboardEarthquakeListGet();
        if (res.data) {
          setEarthquakeList(res.data);
          setSelectedEq((prev) =>
            prev === -1 ? res.data.earthquakeList[0].id : prev
          );
        }
      };
      fetchData();
    }
  }, [earthquakeData, isEarthquakeOverview]);

  return (
    <div className="flex flex-col gap-6" key={`earthquake-view-${refreshKey}`}>
      {isEarthquakeOverview ? (
        <EarthquakeOverviewFilter
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
        />
      ) : (
        <EarthquakeDetailFilter
          earthquakeList={earthquakeList?.earthquakeList ?? []}
          selectedEq={selectedEq}
          setSelectedEq={setSelectedEq}
        />
      )}

      {earthquakeData && (
        <>
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
