import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootLayout from "./layout";

// Mocking components to isolate layout tests
vi.mock("@/components/layout/Navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/layout/Footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/components/ui/WhatsAppWidget", () => ({ WhatsAppWidget: () => <div data-testid="whatsapp-widget" /> }));

describe("RootLayout component", () => {
  it("should render children correctly", () => {
    // Note: Next.js Layout contains <html> and <body>.
    // In JSDOM, we need to handle that carefully.
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

    // No JSDOM, <html> e <body> podem não ser renderizados como tags reais quando dentro de uma div
    // Mas o Next.js os emite, então verificamos se os elementos com as classes corretas estão lá
    
    // Verificamos a Navbar e Footer, que são peças chave do layout
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    
    // Verificamos se o conteúdo está envolvido em uma tag main com padding (pt-20)
    const main = container.querySelector('main');
    expect(main).toHaveClass('flex-grow', 'pt-20');
  });
});
