interface EarthquakeSummary {
  occurrenceTime: string;
  magnitude: string;
  averageIntensity: string;
  alertCompletionRate: string;
  alertActivationRate: string;
  damageRate: string;
}

interface EarthquakeEventType {
  type: string;
  count: number;
}

interface EarthquakeProgress {
  zone: string;
  severity: string;
  state: string;
}

interface EarthquakeList {
  id: number;
  label: string;
}

interface EarthquakeData {
  earthquakeSummary: Record<string, EarthquakeSummary>;
  earthquakeEventType: EarthquakeEventType[];
  earthquakeProgress: EarthquakeProgress[];
  earthquakeList: EarthquakeList[];
}

// Mock data
const mockEarthquakeList: EarthquakeData["earthquakeList"] = [
  { id: 1, label: "2024-06-20 14:32 (M6.2)" },
  { id: 2, label: "2024-06-18 09:10 (M5.8)" },
  { id: 3, label: "2024-06-15 22:45 (M4.9)" },
];

const mockSummaryMap: EarthquakeData["earthquakeSummary"] = {
  "1": {
    occurrenceTime: "2024-06-20 14:32",
    magnitude: "6.2",
    averageIntensity: "V",
    alertCompletionRate: "92%",
    alertActivationRate: "80%",
    damageRate: "15%",
  },
  "2": {
    occurrenceTime: "2024-06-18 09:10",
    magnitude: "5.8",
    averageIntensity: "IV",
    alertCompletionRate: "88%",
    alertActivationRate: "70%",
    damageRate: "10%",
  },
  "3": {
    occurrenceTime: "2024-06-15 22:45",
    magnitude: "4.9",
    averageIntensity: "III",
    alertCompletionRate: "95%",
    alertActivationRate: "60%",
    damageRate: "5%",
  },
};

const mockEventTypeData: EarthquakeData["earthquakeEventType"] = [
  { type: "L1", count: 12 },
  { type: "L2", count: 6 },
];

const mockProgressData: EarthquakeData["earthquakeProgress"] = [
  { zone: "Taipei", severity: "high", state: "active" },
  { zone: "Taoyuan", severity: "medium", state: "completed" },
  { zone: "New Taipei", severity: "low", state: "suppressed" },
];

export {
  mockEarthquakeList,
  mockSummaryMap,
  mockEventTypeData,
  mockProgressData,
};
export type {
  EarthquakeSummary,
  EarthquakeEventType,
  EarthquakeProgress,
  EarthquakeList,
  EarthquakeData,
};
