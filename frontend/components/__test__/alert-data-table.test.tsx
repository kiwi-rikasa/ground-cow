import { render, screen } from "@testing-library/react";
import { AlertDataTable } from "@/components/table/alert-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlertPublic } from "@/app/client";

const mockAlertData: AlertPublic[] = [
  {
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
  {
    alert_id: 2,
    event_id: 1,
    zone_id: 1,
    alert_alert_time: "2024-03-20T10:00:00Z",
    alert_state: "resolved",
    alert_is_suppressed_by: 101,
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
    alert_created_at: "2024-03-21T11:00:00Z",
  },
  {
    alert_id: 3,
    event_id: 2,
    zone_id: 2,
    alert_alert_time: "2024-03-21T12:00:00Z",
    alert_state: "resolved", // 使用合法的枚舉值
    alert_is_suppressed_by: null,
    zone: {
      zone_id: 2,
      zone_name: "Zone 2",
      zone_note: "Zone 2 note",
      zone_regions: "Region 2",
      zone_created_at: "2024-03-20T10:00:00Z",
    },
    event: {
      event_id: 2,
      event_intensity: 2,
      event_severity: "L2",
      earthquake_id: 2,
      earthquake: {
        earthquake_id: 2,
        earthquake_created_at: "2024-03-21T12:00:00Z",
        earthquake_magnitude: 2,
        earthquake_occurred_at: "2024-03-21T12:00:00Z",
        earthquake_source: "Source 2",
      },
      zone_id: 2,
      zone: {
        zone_id: 2,
        zone_name: "Zone 2",
        zone_note: "Zone 2 note",
        zone_regions: "Region 2",
        zone_created_at: "2024-03-20T10:00:00Z",
      },
      event_created_at: "2024-03-21T12:00:00Z",
    },
    alert_created_at: "2024-03-21T12:00:00Z",
  },
];

// Mock required components and services
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/components/create-report-dialog", () => ({
  CreateReportDialog: ({ trigger }: { trigger: React.ReactNode }) => (
    <div data-testid="create-report-dialog">{trigger}</div>
  ),
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

describe("AlertDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with alert data", () => {
    render(<AlertDataTable data={mockAlertData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableHeaders = screen.getAllByRole("cell");
    expect(tableHeaders.length).toBeGreaterThan(0);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("displays no data message when data is empty", () => {
    render(<AlertDataTable data={[]} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple alert rows correctly", () => {
    render(<AlertDataTable data={mockAlertData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4); // 標題行和三行數據

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it.skip("allows filtering alerts by ID", () => {
    render(<AlertDataTable data={mockAlertData} />);

    // 找到搜尋輸入欄
    const searchInput = screen.getByPlaceholderText("Search alerts...");
    expect(searchInput).toBeInTheDocument();
  });

  it("displays correct alert states", () => {
    render(<AlertDataTable data={mockAlertData} />);

    // 檢查各種狀態是否顯示
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getAllByText("resolved").length).toBe(2); // 兩個resolved狀態的警報
  });
});
