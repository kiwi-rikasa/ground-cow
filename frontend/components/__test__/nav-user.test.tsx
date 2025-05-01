import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NavUser } from "@/components/nav-user";
import { signIn, signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/components/ui/sidebar";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { PropsWithChildren, ButtonHTMLAttributes, HTMLAttributes } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;
type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual<typeof import("next-auth/react")>(
    "next-auth/react"
  );
  return {
    ...actual,
    useSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: vi.fn(),

  SidebarMenu: (props: DivProps) => <div {...props} />,
  SidebarMenuItem: (props: DivProps) => <div {...props} />,
  SidebarMenuButton: (props: ButtonProps) => <button {...props} />,
}));

describe("NavUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Sign In button when not authenticated and triggers signIn", () => {
    (useSession as Mock).mockReturnValue({ data: null });
    (useSidebar as Mock).mockReturnValue({ isMobile: false });

    render(<NavUser />);

    const signInBtn = screen.getByRole("button", { name: /Sign In/i });
    expect(signInBtn).toBeInTheDocument();

    const avatarImage = screen.getByRole("img");
    expect(avatarImage).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(signIn).toHaveBeenCalledWith("google");
  });

  it("displays user info and dropdown menu when authenticated, and handles signOut", async () => {
    const fakeUser = {
      name: "Sally Chen",
      email: "sally@example.com",
      image: "avatar.png",
    };
    (useSession as Mock).mockReturnValue({ data: { user: fakeUser } });
    (useSidebar as Mock).mockReturnValue({ isMobile: false });

    render(<NavUser />);

    const trigger = screen.getByRole("button", { name: /Sally Chen/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText(/Account/i)).not.toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: " " });

    const avatarImage = screen.getByRole("img");
    expect(avatarImage).toBeInTheDocument();

    const accountItem = await screen.findByRole("menuitem", {
      name: /Account/i,
    });
    const billingItem = await screen.findByRole("menuitem", {
      name: /Billing/i,
    });
    const notifItem = await screen.findByRole("menuitem", {
      name: /Notifications/i,
    });
    const logoutItem = await screen.findByRole("menuitem", {
      name: /Log out/i,
    });

    expect(accountItem).toBeInTheDocument();
    expect(billingItem).toBeInTheDocument();
    expect(notifItem).toBeInTheDocument();
    expect(logoutItem).toBeInTheDocument();

    fireEvent.click(logoutItem);
    expect(signOut).toHaveBeenCalled();
  });

  it("displays avatar fallback", async () => {
    const fakeUser = {
      name: "Sally Chen",
      email: "sally@example.com",
    };
    (useSession as Mock).mockReturnValue({ data: { user: fakeUser } });
    (useSidebar as Mock).mockReturnValue({ isMobile: false });

    render(<NavUser />);

    const trigger = screen.getByRole("button", { name: /Sally Chen/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: " " });

    const avatarImage = screen.getByRole("img");
    expect(avatarImage).toBeInTheDocument();
  });

  it("opens menu on the right side when not mobile", async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: "Sally",
          email: "sally@example.com",
          image: "avatar.png",
        },
      },
    });
    (useSidebar as Mock).mockReturnValue({ isMobile: false });

    render(<NavUser />);

    const trigger = screen.getByRole("button", { name: /Sally/i });
    fireEvent.keyDown(trigger, { key: " " });

    const menuContent = await screen.findByRole("menu");
    expect(menuContent).toHaveAttribute("data-side", "right");
  });

  it("opens menu on the bottom side when mobile", async () => {
    (useSession as Mock).mockReturnValue({
      data: {
        user: {
          name: "Sally",
          email: "sally@example.com",
          image: "avatar.png",
        },
      },
    });
    (useSidebar as Mock).mockReturnValue({ isMobile: true });

    render(<NavUser />);

    const trigger = screen.getByRole("button", { name: /Sally/i });
    fireEvent.keyDown(trigger, { key: " " });

    const menuContent = await screen.findByRole("menu");
    expect(menuContent).toHaveAttribute("data-side", "bottom");
  });
});
