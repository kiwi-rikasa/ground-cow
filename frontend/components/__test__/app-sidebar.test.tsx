import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("next-auth/react", async () => {
  const actual = await vi.importActual<typeof import("next-auth/react")>(
    "next-auth/react"
  );
  return {
    ...actual,
    useSession: () => ({
      data: null,
      status: "unauthenticated",
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>{children}</SidebarProvider>
);

describe("AppSidebar", () => {
  it("renders the full sidebar layout with navigation and footer", () => {
    render(<AppSidebar />, { wrapper: Wrapper });

    expect(screen.getByText("TSMC")).toBeInTheDocument();

    const mainNavItems = ["Dashboard", "Reports", "Events", "Team"];
    mainNavItems.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    const secondaryItems = ["Settings", "Get Help", "Search"];
    secondaryItems.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
