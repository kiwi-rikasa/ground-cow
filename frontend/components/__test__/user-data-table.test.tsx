import { render, screen } from "@testing-library/react";
import { UserDataTable } from "@/components/table/user-data-table";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserPublic } from "@/app/client";

const mockUserData: UserPublic[] = [
  {
    user_id: 1,
    user_name: "Admin User",
    user_email: "admin@example.com",
    user_role: "admin",
    user_created_at: "2024-03-20T10:00:00Z",
  },
  {
    user_id: 2,
    user_name: "Control User",
    user_email: "control@example.com",
    user_role: "control",
    user_created_at: "2024-03-21T11:30:00Z",
  },
  {
    user_id: 3,
    user_name: "Operator User",
    user_email: "operator@example.com",
    user_role: "operator",
    user_created_at: "2024-03-22T12:15:00Z",
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

describe("UserDataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with user data", () => {
    render(<UserDataTable data={mockUserData} setData={mockSetData} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    const tableHeaders = screen.getAllByRole("cell");
    expect(tableHeaders.length).toBeGreaterThan(0);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(1);
  });

  it("displays no data message when data is empty", () => {
    render(<UserDataTable data={[]} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(2); // 標題行和空數據行
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders multiple user rows correctly", () => {
    render(<UserDataTable data={mockUserData} setData={mockSetData} />);

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(4); // 標題行和三行數據

    const dataCells = screen.getAllByRole("cell");
    expect(dataCells.length).toBeGreaterThan(0);
  });

  it("displays correct user role badges", () => {
    render(<UserDataTable data={mockUserData} setData={mockSetData} />);

    // 檢查用戶角色是否正確顯示
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("control")).toBeInTheDocument();
    expect(screen.getByText("operator")).toBeInTheDocument();
  });

  it("displays user emails correctly", () => {
    render(<UserDataTable data={mockUserData} setData={mockSetData} />);

    // 檢查郵箱地址是否正確顯示
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("control@example.com")).toBeInTheDocument();
    expect(screen.getByText("operator@example.com")).toBeInTheDocument();
  });

  it("displays user names correctly", () => {
    render(<UserDataTable data={mockUserData} setData={mockSetData} />);

    // 檢查郵箱地址是否正確顯示
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Control User")).toBeInTheDocument();
    expect(screen.getByText("Operator User")).toBeInTheDocument();
  });
});
