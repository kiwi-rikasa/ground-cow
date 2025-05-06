import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { NavSecondary } from "@/components/nav-secondary";
import { IconSettings, IconSearch } from "@tabler/icons-react";
import { PropsWithChildren, HTMLAttributes } from "react";

type DefaultProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

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
    <div data-testid="sidebar-menu-button" {...props}>
      {props.children}
    </div>
  ),
}));

describe("NavSecondary", () => {
  it("renders all items with titles and links", () => {
    const items = [
      { title: "Settings", url: "/settings", icon: IconSettings },
      { title: "Search", url: "/search", icon: IconSearch },
    ];

    render(<NavSecondary items={items} />);

    const menuItems = screen.getAllByTestId("sidebar-menu-item");
    expect(menuItems.length).toBe(2);

    for (const item of items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: item.title })).toHaveAttribute(
        "href",
        item.url
      );
    }
  });
});
