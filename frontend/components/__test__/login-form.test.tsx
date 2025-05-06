import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "@/components/login-form";
import { signIn } from "next-auth/react";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders welcome message and buttons", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("heading", { name: /welcome to TSMC Inc./i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument();
  });

  it("calls signIn('google') when the button is clicked", () => {
    render(<LoginForm />);

    const googleButton = screen.getByRole("button", {
      name: /continue with google/i,
    });

    fireEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith("google");
  });

  it("contains links to Terms of Service and Privacy Policy", () => {
    render(<LoginForm />);

    const termsLink = screen.getByText(/terms of service/i);
    const privacyLink = screen.getByText(/privacy policy/i);

    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "#");

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "#");
  });
});
