import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { SiteHeader } from "@/components/site-header";
import { PropsWithChildren, ButtonHTMLAttributes, HTMLAttributes } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;
type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: (props: ButtonProps) => (
    <button data-testid="sidebar-trigger" {...props} />
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: (props: DivProps) => <div data-testid="separator" {...props} />,
}));

describe("SiteHeader", () => {
  it("renders header with sidebar trigger, separator, and title", () => {
    render(<SiteHeader />);

    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("separator")).toBeInTheDocument();
    expect(screen.getByText("Event Logging System")).toBeInTheDocument();
  });
});
