interface ZoneStats {
  totalEvents: number;
  alertActivationRate: number;
  damageRate: number;
  alertCompletionRate: number;
  alertSuppressionRate: number;
  avgResponseTime: string;
}

interface ZoneEventTrend {
  date: string;
  L1: number;
  L2: number;
}

interface ZoneHistogramData {
  bin: string;
  count: number;
}

interface ZoneData {
  zoneStats: ZoneStats;
  zoneEventTrend: ZoneEventTrend[];
  zoneMagnitudeData: ZoneHistogramData[];
  zoneIntensityData: ZoneHistogramData[];
}

// Mock data
const mockStats: ZoneData["zoneStats"] = {
  totalEvents: 123,
  alertActivationRate: 80,
  damageRate: 12,
  alertCompletionRate: 95,
  alertSuppressionRate: 5,
  avgResponseTime: "2m 30s",
};

const mockEventTrend: ZoneData["zoneEventTrend"] = [
  { date: "5/10", L1: 6, L2: 1 },
  { date: "5/11", L1: 7, L2: 1 },
  { date: "5/12", L1: 8, L2: 2 },
  { date: "5/13", L1: 9, L2: 2 },
  { date: "5/14", L1: 10, L2: 2 },
  { date: "5/15", L1: 18, L2: 3 },
  { date: "5/16", L1: 12, L2: 3 },
  { date: "5/17", L1: 8, L2: 4 },
  { date: "5/18", L1: 9, L2: 4 },
  { date: "5/19", L1: 15, L2: 7 },
  { date: "5/20", L1: 13, L2: 9 },
  { date: "5/21", L1: 14, L2: 8 },
  { date: "5/22", L1: 11, L2: 7 },
  { date: "5/23", L1: 13, L2: 6 },
  { date: "5/24", L1: 16, L2: 7 },
  { date: "5/25", L1: 17, L2: 8 },
];

const mockMagnitudeData: ZoneData["zoneMagnitudeData"] = [
  { bin: "3.0-3.9", count: 2 },
  { bin: "4.0-4.9", count: 5 },
  { bin: "5.0-5.9", count: 8 },
  { bin: "6.0-6.9", count: 3 },
  { bin: "7.0-7.9", count: 1 },
];

const mockIntensityData: ZoneData["zoneIntensityData"] = [
  { bin: "I-II", count: 1 },
  { bin: "III-IV", count: 4 },
  { bin: "V-VI", count: 7 },
  { bin: "VII-VIII", count: 5 },
  { bin: "IX+", count: 2 },
];

export { mockStats, mockEventTrend, mockMagnitudeData, mockIntensityData };
export type { ZoneStats, ZoneEventTrend, ZoneHistogramData, ZoneData };
