import { render, screen } from "@testing-library/react";
import { EventDataTable } from "@/components/table/event-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventPublic } from "@/app/client";

const mockEventData: EventPublic[] = [
  {
    event_id: 1,
    event_intensity: 4.5,
    event_severity: "NA",
    earthquake_id: 1,
    earthquake: {
      earthquake_id: 1,
      earthquake_created_at: "2024-03-20T10:00:00Z",
      earthquake_magnitude: 5.2,
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
  {
    event_id: 2,
    event_intensity: 6.1,
    event_severity: "L2",
    earthquake_id: 2,
    earthquake: {
      earthquake_id: 2,
      earthquake_created_at: "2024-03-21T11:30:00Z",
      earthquake_magnitude: 6.4,
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
  {
    event_id: 3,
    event_intensity: 3.2,
    event_severity: "L1",
    earthquake_id: 3,
    earthquake: {
      earthquake_id: 3,
      earthquake_created_at: "2024-03-22T15:00:00Z",
      earthquake_magnitude: 3.5,
      earthquake_occurred_at: "2024-03-22T15:00:00Z",
      earthquake_source: "Source 3",
    },
    zone_id: 3,
    zone: {
      zone_id: 3,
      zone_name: "Zone 3",
      zone_note: "Zone 3 note",
      zone_regions: "Region 3",
      zone_created_at: "2024-03-18T09:00:00Z",
    },
    event_created_at: "2024-03-22T15:00:00Z",
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

describe("EventDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with event data", () => {
    render(<EventDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableHeaders = screen.getAllByRole("cell");
    expect(tableHeaders.length).toBeGreaterThan(0);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("displays no data message when data is empty", () => {
    render(<EventDataTable data={[]} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple event rows correctly", () => {
    render(<EventDataTable data={mockEventData} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4);

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it("displays correct event severities", () => {
    render(<EventDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByText("NA")).toBeInTheDocument();
    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
  });

  it("displays correct event intensities", () => {
    render(<EventDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("6.1")).toBeInTheDocument();
    expect(screen.getByText("3.2")).toBeInTheDocument();
  });

  it("displays correct zone information", () => {
    render(<EventDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByText("Zone 1")).toBeInTheDocument();
    expect(screen.getByText("Zone 2")).toBeInTheDocument();
    expect(screen.getByText("Zone 3")).toBeInTheDocument();
  });
});
