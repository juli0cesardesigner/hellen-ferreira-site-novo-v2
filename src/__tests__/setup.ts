import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock das fontes do Next.js
vi.mock("next/font/google", () => ({
  Cormorant_Garamond: () => ({
    variable: "--font-serif",
  }),
  Lato: () => ({
    variable: "--font-sans",
  }),
  Inter: () => ({
    variable: "--font-admin",
  }),
}));

// Mock do next/navigation (comum em testes de layout)
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));
