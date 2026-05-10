import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge string classes correctly", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("should merge tailwind classes with conflicts correctly", () => {
    // twMerge logic: should resolve conflicts
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle conditional classes correctly", () => {
    expect(cn("px-2", true && "py-2", false && "mt-1")).toBe("px-2 py-2");
  });

  it("should handle object notations", () => {
    expect(cn({ "bg-red-500": true, "text-white": false })).toBe("bg-red-500");
  });

  it("should handle undefined and null", () => {
    expect(cn("px-2", undefined, null, "py-2")).toBe("px-2 py-2");
  });
});
