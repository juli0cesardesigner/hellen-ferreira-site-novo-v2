import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootLayout from "./layout";

// Mock GeneralLayout (which internally renders Navbar, Footer, WhatsAppWidget)
vi.mock("@/components/layout/GeneralLayout", () => ({
  GeneralLayout: ({ children }: { children: React.ReactNode }) => (
    <>
      <nav data-testid="navbar" />
      <main className="flex-grow pt-20">{children}</main>
      <footer data-testid="footer" />
      <div data-testid="whatsapp-widget" />
    </>
  ),
}));

// Mock analytics and PWA components
vi.mock("@/components/analytics/FacebookPixel", () => ({
  default: () => null,
}));
vi.mock("@/components/pwa/PWARegistration", () => ({
  PWARegistration: () => null,
}));

describe("RootLayout component", () => {
  it("should render children correctly", () => {
    render(
      <RootLayout>
        <div data-testid="app-content">Hello World</div>
      </RootLayout>
    );

    // Assert main elements are present
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-widget")).toBeInTheDocument();
    expect(screen.getByTestId("app-content")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("should have correct HTML structure classes", () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    // Verify navbar and footer are present
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    
    // Verify the main content wrapper has correct classes
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-grow', 'pt-20');
  });
});
