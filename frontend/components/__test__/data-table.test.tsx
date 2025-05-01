import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataTable } from "@/components/data-table";
import { schema } from "@/components/data-table";
import { z } from "zod";

type Item = z.infer<typeof schema>;
const mockData: Item[] = [
  {
    id: 0,
    header: "TASK-0001",
    status: "Resolved",
    reviewer: "Alice",
    damage: "True",
    action: "False",
    occurredTime: new Date("2023-01-01T10:00:00Z"),
    lastUpdated: new Date("2023-01-01T10:30:00Z"),
    reporter: "John",
  },
  {
    id: 1,
    header: "TASK-0002",
    status: "Active",
    reviewer: "Bob",
    damage: "",
    action: "",
    occurredTime: new Date("2023-01-01T10:00:00Z"),
    lastUpdated: null,
    reporter: "",
  },
  {
    id: 2,
    header: "TASK-0003",
    status: "Closed",
    reviewer: "Alice",
    damage: "",
    action: "",
    occurredTime: new Date("2023-01-01T10:00:00Z"),
    lastUpdated: new Date(),
    reporter: "",
  },
];

describe("DataTable", () => {
  it("renders the table with data", () => {
    render(<DataTable data={mockData} />);
    expect(screen.getByText(/TASK-0001/)).toBeInTheDocument();
    expect(screen.getByText(/Resolved/)).toBeInTheDocument();
    expect(screen.getAllByRole("icon")).toHaveLength(3);
  });

  it("shows the drawer when row title is clicked", async () => {
    render(<DataTable data={mockData} />);
    const button = screen.getByRole("button", { name: /TASK-0001/i });
    button.click();
    expect(
      await screen.findByText(/Please provide the detailed report/i)
    ).toBeInTheDocument();
  });

  it("displays row selection checkbox", () => {
    render(<DataTable data={mockData} />);
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });

  it("toggles a column visibility", async () => {
    render(<DataTable data={mockData} />);

    const trigger = screen.getByRole("button", {
      name: /customize columns/i,
    });

    fireEvent.keyDown(trigger, { key: " " });

    const selectedItem = await screen.getAllByText(/status/i)[1];
    fireEvent.click(selectedItem);

    const headers = screen.getAllByRole("header");
    headers.forEach((header) => {
      expect(header).to.toHaveAttribute("colspan", "1");
    });
    expect(headers).not.toContain(/status/i);

    fireEvent.keyDown(trigger, { key: " " });
    const checkbox = screen.getAllByRole("menuitemcheckbox")[0];
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it('displays "-" when lastUpdated is null', async () => {
    render(<DataTable data={mockData} />);
    const titleBtn = screen.getByRole("button", {
      name: /TASK-0002/i,
    });
    fireEvent.click(titleBtn);

    const lastUpdatedText = await screen.getAllByText("-")[0];
    expect(lastUpdatedText).toBeInTheDocument();
  });

  it("updates filter value when typing", async () => {
    render(<DataTable data={mockData} />);

    const input = screen.getByPlaceholderText("Search tasks...");
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "2" } });
    const dropdown = await screen.getAllByRole("row")[1];
    expect(dropdown).not.toHaveTextContent("TASK-0001");
    expect(dropdown).toHaveTextContent("TASK-0002");

    fireEvent.change(input, { target: { value: "20" } });
    expect(screen.getByText(/No results./i)).toBeInTheDocument();
  });

  it("updates number of rows", async () => {
    render(<DataTable data={mockData} />);

    expect(screen.getByLabelText(/rows per page/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();

    const selectTrigger = screen.getByRole("combobox");
    fireEvent.keyDown(selectTrigger, { key: " " });

    const selectContent = screen.getByText(
      (content) => content.trim() === "20"
    );
    fireEvent.click(selectContent);
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
  });
});
