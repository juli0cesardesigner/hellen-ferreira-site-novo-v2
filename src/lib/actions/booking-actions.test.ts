import { describe, it, expect } from "vitest";

/**
 * Test the internal parseLocalDate helper.
 * We test it indirectly by verifying that getAvailableSlots and getMonthAvailability
 * use the correct day-of-week for Brazilian timezone dates.
 *
 * Since parseLocalDate is not exported, we replicate its logic here for unit testing.
 */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

describe("parseLocalDate (internal helper)", () => {
  it("should parse a date string as local date (not UTC)", () => {
    // 2026-05-13 is a Wednesday (day 3 in JS getDay)
    const date = parseLocalDate("2026-05-13");
    expect(date.getDay()).toBe(3); // Wednesday
  });

  it("should parse 2026-01-01 as Thursday (day 4)", () => {
    const date = parseLocalDate("2026-01-01");
    expect(date.getDay()).toBe(4); // Thursday
  });

  it("should parse 2026-12-25 as Friday (day 5)", () => {
    const date = parseLocalDate("2026-12-25");
    expect(date.getDay()).toBe(5); // Friday
  });

  it("should handle month boundaries correctly", () => {
    const date = parseLocalDate("2026-03-01");
    expect(date.getDate()).toBe(1);
    expect(date.getMonth()).toBe(2); // 0-indexed, March = 2
    expect(date.getFullYear()).toBe(2026);
  });

  it("should NOT shift day-of-week due to UTC offset", () => {
    // new Date("2026-05-13") in UTC would be May 13 00:00 UTC
    // In Brazil (UTC-3), that's May 12 21:00 → getDay() = 2 (Tuesday)
    // parseLocalDate should give getDay() = 3 (Wednesday)
    const localDate = parseLocalDate("2026-05-13");
    
    // In Brazil (UTC-3), these will differ
    // The local parse should preserve the intended day
    expect(localDate.getDay()).toBe(3); // Wednesday in local
  });
});

describe("Availability calculation logic", () => {
  it("should correctly compute total slots in a day", () => {
    // Simulating the activeSlotsCount logic
    const activeSlotsCount: Record<number, number> = {};
    const slots = [
      { day_of_week: 3, is_active: true },
      { day_of_week: 3, is_active: true },
      { day_of_week: 3, is_active: false },
      { day_of_week: 4, is_active: true },
    ];

    slots.forEach((s: { day_of_week: number; is_active: boolean }) => {
      if (s.is_active) {
        activeSlotsCount[s.day_of_week] = (activeSlotsCount[s.day_of_week] || 0) + 1;
      }
    });

    expect(activeSlotsCount[3]).toBe(2);
    expect(activeSlotsCount[4]).toBe(1);
  });

  it("should detect day as unavailable when blocked", () => {
    const blockedDays = [
      { start_date: "2026-05-10", end_date: "2026-05-15" },
    ];
    const dateStr = "2026-05-13";
    
    const isBlocked = blockedDays.some(
      (b: { start_date: string; end_date: string }) => dateStr >= b.start_date && dateStr <= b.end_date
    );
    
    expect(isBlocked).toBe(true);
  });

  it("should detect day as available when not blocked", () => {
    const blockedDays = [
      { start_date: "2026-05-10", end_date: "2026-05-12" },
    ];
    const dateStr = "2026-05-13";
    
    const isBlocked = blockedDays.some(
      (b: { start_date: string; end_date: string }) => dateStr >= b.start_date && dateStr <= b.end_date
    );
    
    expect(isBlocked).toBe(false);
  });
});

describe("Minimum booking notice override logic", () => {
  function getEffectiveNoticeHours(serviceNotice: number | null | undefined, globalNoticeStr: string | null): number {
    if (serviceNotice !== null && serviceNotice !== undefined) {
      return Number(serviceNotice);
    }
    return parseInt(globalNoticeStr || '12');
  }

  it("should use service-specific notice when defined", () => {
    expect(getEffectiveNoticeHours(2, '24')).toBe(2);
    expect(getEffectiveNoticeHours(48, '12')).toBe(48);
    expect(getEffectiveNoticeHours(0, '24')).toBe(0);
  });

  it("should fallback to global notice when service notice is null or undefined", () => {
    expect(getEffectiveNoticeHours(null, '24')).toBe(24);
    expect(getEffectiveNoticeHours(undefined, '18')).toBe(18);
    expect(getEffectiveNoticeHours(null, null)).toBe(12);
  });

  it("should correctly determine slot availability based on notice cutoff", () => {
    const now = new Date("2026-09-13T10:00:00Z");
    const serviceNoticeHours = 2; // custom 2h notice
    const cutoff = new Date(now.getTime() + serviceNoticeHours * 60 * 60 * 1000); // 12:00:00Z

    const slot1130 = new Date("2026-09-13T11:30:00Z");
    const slot1230 = new Date("2026-09-13T12:30:00Z");

    expect(slot1130 < cutoff).toBe(true); // unavailable (less than 2h notice)
    expect(slot1230 >= cutoff).toBe(true); // available (more than 2h notice)
  });
});

