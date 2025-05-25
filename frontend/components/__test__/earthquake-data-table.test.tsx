import { render, screen } from "@testing-library/react";
import { EarthquakeDataTable } from "@/components/table/earthquake-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EarthquakePublic } from "@/app/client/types.gen";

const mockEventData: EarthquakePublic[] = [
  {
    earthquake_id: 1,
    earthquake_created_at: "2024-03-20T10:00:00Z",
    earthquake_magnitude: 5.2,
    earthquake_occurred_at: "2024-03-20T10:00:00Z",
    earthquake_source: "Source 1",
  },
  {
    earthquake_id: 2,
    earthquake_created_at: "2024-03-21T11:30:00Z",
    earthquake_magnitude: 6.4,
    earthquake_occurred_at: "2024-03-21T11:30:00Z",
    earthquake_source: "Source 2",
  },
  {
    earthquake_id: 3,
    earthquake_created_at: "2024-03-22T15:00:00Z",
    earthquake_magnitude: 3.5,
    earthquake_occurred_at: "2024-03-22T15:00:00Z",
    earthquake_source: "Source 3",
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

describe("EarthquakeDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with earthquake data", () => {
    render(<EarthquakeDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("displays no data message when data is empty", () => {
    render(<EarthquakeDataTable data={[]} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple earthquake rows correctly", () => {
    render(<EarthquakeDataTable data={mockEventData} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4);

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it("displays correct earthquake magnitudes", () => {
    render(<EarthquakeDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByText("5.2")).toBeInTheDocument();
    expect(screen.getByText("6.4")).toBeInTheDocument();
    expect(screen.getByText("3.5")).toBeInTheDocument();
  });

  it("displays correct earthquake sources", () => {
    render(<EarthquakeDataTable data={mockEventData} setData={mockSetData} />);

    expect(screen.getByText("Source 1")).toBeInTheDocument();
    expect(screen.getByText("Source 2")).toBeInTheDocument();
    expect(screen.getByText("Source 3")).toBeInTheDocument();
  });
});
