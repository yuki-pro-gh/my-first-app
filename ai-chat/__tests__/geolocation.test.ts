import { describe, it, expect, vi, afterEach } from "vitest";
import { reverseGeocode } from "@/lib/geolocation";

describe("reverseGeocode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("都市名と国名が返される", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({
        address: { city: "Tokyo", country: "Japan" },
      }),
    }));

    const result = await reverseGeocode(35.6895, 139.6917);
    expect(result).toBe("Tokyo, Japan");
  });

  it("cityがない場合はtownを使う", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({
        address: { town: "Hakone", country: "Japan" },
      }),
    }));

    const result = await reverseGeocode(35.2, 139.0);
    expect(result).toBe("Hakone, Japan");
  });

  it("住所情報がない場合はundefinedを返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: async () => ({ address: {} }),
    }));

    const result = await reverseGeocode(0, 0);
    expect(result).toBeUndefined();
  });
});
