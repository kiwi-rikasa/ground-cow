import { render, screen } from "@testing-library/react";
import { ReportDataTable } from "@/components/table/report-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportPublic } from "@/app/client";

const mockReportData: ReportPublic[] = [
  {
    report_id: 1,
    report_action_flag: true,
    report_damage_flag: false,
    report_factory_zone: 1,
    report_reported_at: "2024-03-20T10:00:00Z",
    report_created_at: "2024-03-20T10:00:00Z",
    alert_id: 1,
    alert: {
      alert_id: 1,
      event_id: 1,
      zone_id: 1,
      alert_alert_time: "2024-03-20T10:00:00Z",
      alert_state: "active",
      alert_is_suppressed_by: null,
      zone: {
        zone_id: 1,
        zone_name: "Zone 1",
        zone_note: "Zone 1 note",
        zone_regions: "Region 1",
        zone_created_at: "2024-03-20T10:00:00Z",
      },
      event: {
        event_id: 1,
        event_intensity: 1,
        event_severity: "L1",
        earthquake_id: 1,
        earthquake: {
          earthquake_id: 1,
          earthquake_created_at: "2024-03-20T10:00:00Z",
          earthquake_magnitude: 1,
          earthquake_occurred_at: "2024-03-20T10:00:00Z",
          earthquake_source: "Source 1",
        },
        zone_id: 1,
        zone: {
          zone_id: 1,
          zone_name: "Zone 1",
          zone_note: "Zone 1 note",
          zone_regions: "Region 1",
          zone_created_at: "2024-03-20T10:00:00Z",
        },
        event_created_at: "2024-03-20T10:00:00Z",
      },
      alert_created_at: "2024-03-20T10:00:00Z",
    },
  },
  {
    report_id: 2,
    report_action_flag: false,
    report_damage_flag: true,
    report_factory_zone: 2,
    report_reported_at: "2024-03-21T11:30:00Z",
    report_created_at: "2024-03-21T11:30:00Z",
    alert_id: 2,
    alert: {
      alert_id: 2,
      event_id: 2,
      zone_id: 2,
      alert_alert_time: "2024-03-21T11:30:00Z",
      alert_state: "resolved",
      alert_is_suppressed_by: null,
      zone: {
        zone_id: 2,
        zone_name: "Zone 2",
        zone_note: "Zone 2 note",
        zone_regions: "Region 2",
        zone_created_at: "2024-03-19T09:00:00Z",
      },
      event: {
        event_id: 2,
        event_intensity: 2,
        event_severity: "L2",
        earthquake_id: 2,
        earthquake: {
          earthquake_id: 2,
          earthquake_created_at: "2024-03-21T11:30:00Z",
          earthquake_magnitude: 2,
          earthquake_occurred_at: "2024-03-21T11:30:00Z",
          earthquake_source: "Source 2",
        },
        zone_id: 2,
        zone: {
          zone_id: 2,
          zone_name: "Zone 2",
          zone_note: "Zone 2 note",
          zone_regions: "Region 2",
          zone_created_at: "2024-03-19T09:00:00Z",
        },
        event_created_at: "2024-03-21T11:30:00Z",
      },
      alert_created_at: "2024-03-21T11:30:00Z",
    },
  },
  {
    report_id: 3,
    report_action_flag: true,
    report_damage_flag: true,
    report_factory_zone: 3,
    report_reported_at: "2024-03-22T12:00:00Z",
    report_created_at: "2024-03-22T12:00:00Z",
    alert_id: 3,
    alert: {
      alert_id: 3,
      event_id: 3,
      zone_id: 3,
      alert_alert_time: "2024-03-22T12:00:00Z",
      alert_state: "active",
      alert_is_suppressed_by: null,
      zone: {
        zone_id: 3,
        zone_name: "Zone 3",
        zone_note: "Zone 3 note",
        zone_regions: "Region 3",
        zone_created_at: "2024-03-18T08:00:00Z",
      },
      event: {
        event_id: 3,
        event_intensity: 3,
        event_severity: "L2",
        earthquake_id: 3,
        earthquake: {
          earthquake_id: 3,
          earthquake_created_at: "2024-03-22T12:00:00Z",
          earthquake_magnitude: 3,
          earthquake_occurred_at: "2024-03-22T12:00:00Z",
          earthquake_source: "Source 3",
        },
        zone_id: 3,
        zone: {
          zone_id: 3,
          zone_name: "Zone 3",
          zone_note: "Zone 3 note",
          zone_regions: "Region 3",
          zone_created_at: "2024-03-18T08:00:00Z",
        },
        event_created_at: "2024-03-22T12:00:00Z",
      },
      alert_created_at: "2024-03-22T12:00:00Z",
    },
  },
];

const mockSetData = vi.fn();

// Mock required components and services
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

// Mock API calls
vi.mock("@/app/client/", () => ({
  updateReportReportReportIdPatch: vi.fn(),
  getReportReportReportIdGet: vi.fn(),
  deleteReportReportReportIdDelete: vi.fn(),
}));

// Simplified DnD mocks - no generics to avoid JSX parsing issues
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useSensor: () => ({}),
  useSensors: () => [],
  KeyboardSensor: vi.fn(),
  MouseSensor: vi.fn(),
  TouchSensor: vi.fn(),
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
  arrayMove: vi.fn((array) => array),
}));

vi.mock("@dnd-kit/modifiers", () => ({
  restrictToVerticalAxis: vi.fn(),
}));

describe("ReportDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with report data", () => {
    render(<ReportDataTable data={mockReportData} setData={mockSetData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableHeaders = screen.getAllByRole("cell");
    expect(tableHeaders.length).toBeGreaterThan(0);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("displays no data message when data is empty", () => {
    render(<ReportDataTable data={[]} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2); // 標題行和空數據行
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple report rows correctly", () => {
    render(<ReportDataTable data={mockReportData} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4); // 標題行和三行數據

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it("displays correct action flags", () => {
    render(<ReportDataTable data={mockReportData} setData={mockSetData} />);

    // 檢查動作標誌顯示
    expect(screen.getAllByText("True").length).toBeGreaterThan(0);
    expect(screen.getAllByText("False").length).toBeGreaterThan(0);
  });

  it("displays correct damage flags", () => {
    render(<ReportDataTable data={mockReportData} setData={mockSetData} />);

    // 檢查損壞標誌顯示
    expect(screen.getAllByText("True").length).toBeGreaterThan(0);
    expect(screen.getAllByText("False").length).toBeGreaterThan(0);
  });

  it("displays correct zone information", () => {
    render(<ReportDataTable data={mockReportData} setData={mockSetData} />);

    // 檢查區域資訊
    expect(screen.getByText("Zone 1")).toBeInTheDocument();
    expect(screen.getByText("Zone 2")).toBeInTheDocument();
    expect(screen.getByText("Zone 3")).toBeInTheDocument();
  });
});
