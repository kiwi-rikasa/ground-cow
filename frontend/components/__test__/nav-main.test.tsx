import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { NavMain } from "@/components/nav-main";
import { IconDashboard, IconUsers } from "@tabler/icons-react";
import { PropsWithChildren, HTMLAttributes } from "react";

type DefaultProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

const pushMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  };
});

vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: (props: DefaultProps) => (
    <div data-testid="sidebar-group" {...props}>
      {props.children}
    </div>
  ),
  SidebarGroupContent: (props: DefaultProps) => (
    <div data-testid="sidebar-group-content" {...props}>
      {props.children}
    </div>
  ),
  SidebarMenu: (props: DefaultProps) => (
    <ul data-testid="sidebar-menu" {...props}>
      {props.children}
    </ul>
  ),
  SidebarMenuItem: (props: DefaultProps) => (
    <li data-testid="sidebar-menu-item" {...props}>
      {props.children}
    </li>
  ),
  SidebarMenuButton: (props: DefaultProps) => (
    <button data-testid="sidebar-menu-button" {...props}>
      {props.children}
    </button>
  ),
}));

describe("NavMain", () => {
  it("calls router.push when a sidebar menu item is clicked", () => {
    const navItems = [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Team", url: "/team", icon: IconUsers },
    ];

    render(<NavMain items={navItems} currentPath="/team" />);

    const dashboardButton = screen.getByText("Dashboard");
    fireEvent.click(dashboardButton);

    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });

  it("renders Quick Create and Inbox buttons", () => {
    render(<NavMain items={[]} currentPath="/dashboard" />);

    expect(screen.getByText("Create Report")).toBeInTheDocument();
  });

  it("renders dynamic sidebar items with icons", () => {
    const navItems = [
      { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
      { title: "Team", url: "/team", icon: IconUsers },
    ];

    render(<NavMain items={navItems} currentPath="/dashboard" />);

    for (const item of navItems) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }

    const buttons = screen.getAllByTestId("sidebar-menu-button");
    expect(buttons.length).toBe(3);
  });
});
