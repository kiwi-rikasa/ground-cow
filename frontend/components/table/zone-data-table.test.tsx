import { render, screen } from "@testing-library/react";
import { ZoneDataTable } from "@/components/table/zone-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ZonePublic } from "@/app/client";

const mockZoneData: ZonePublic[] = [
  {
    zone_id: 1,
    zone_name: "Zone A",
    zone_regions: "Region 1, Region 2",
    zone_note: "This is a note for Zone A",
    zone_created_at: "2024-03-20T10:00:00Z",
  },
  {
    zone_id: 2,
    zone_name: "Zone B",
    zone_regions: "Region 3",
    zone_note: "This is a note for Zone B",
    zone_created_at: "2024-03-21T11:30:00Z",
  },
  {
    zone_id: 3,
    zone_name: "Zone C",
    zone_regions: "Region 4, Region 5, Region 6",
    zone_note: "This is a note for Zone C",
    zone_created_at: "2024-03-22T12:15:00Z",
  },
];

const mockSetData = vi.fn();

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

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

describe("ZoneDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with zone data", () => {
    render(<ZoneDataTable data={mockZoneData} setData={mockSetData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableHeaders = screen.getAllByRole("cell");
    expect(tableHeaders.length).toBeGreaterThan(0);

    const rows = screen.getAllByRole("row");
    // Header row + 3 data rows
    expect(rows.length).toBe(mockZoneData.length + 1);
  });

  it("displays no data message when data is empty", () => {
    render(<ZoneDataTable data={[]} setData={mockSetData} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2); // Header row and empty data row
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple zone rows correctly", () => {
    render(<ZoneDataTable data={mockZoneData} setData={mockSetData} />);
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(mockZoneData.length + 1);

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it("displays zone names correctly", () => {
    render(<ZoneDataTable data={mockZoneData} setData={mockSetData} />);
    expect(screen.getByText("Zone A")).toBeInTheDocument();
    expect(screen.getByText("Zone B")).toBeInTheDocument();
    expect(screen.getByText("Zone C")).toBeInTheDocument();
  });

  it("displays zone regions correctly", () => {
    render(<ZoneDataTable data={mockZoneData} setData={mockSetData} />);
    expect(screen.getByText("Region 1, Region 2")).toBeInTheDocument();
    expect(screen.getByText("Region 3")).toBeInTheDocument();
    expect(
      screen.getByText("Region 4, Region 5, Region 6")
    ).toBeInTheDocument();
  });

  it("displays zone notes correctly", () => {
    render(<ZoneDataTable data={mockZoneData} setData={mockSetData} />);
    expect(screen.getByText("This is a note for Zone A")).toBeInTheDocument();
    expect(screen.getByText("This is a note for Zone B")).toBeInTheDocument();
    expect(screen.getByText("This is a note for Zone C")).toBeInTheDocument();
  });
});
