import { beforeEach, describe, expect, it, vi } from "vitest";

import { encodeData } from "@/lib/encodeData";
import { generateLink } from "@/lib/generateLink";

import appConfig from "@/appConfig";

describe("generateLink", () => {
  vi.mock("@/appConfig", () => ({
    default: { TESTNET: false },
  }));

  vi.mock("@/lib/encodeData", () => ({
    encodeData: vi.fn(),
  }));

  const baseParams = {
    amount: 1000,
    aa: "AA_ADDRESS",
    data: { key: "value" },
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should generate a basic link with required parameters", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    const link = generateLink(baseParams);
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=base&base64data=encodedData");
  });

  it("should include from_address if provided", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    const link = generateLink({ ...baseParams, from_address: "FROM_ADDRESS" });
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=base&base64data=encodedData&from_address=FROM_ADDRESS");
  });

  it("should include is_single if provided", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    const link = generateLink({ ...baseParams, is_single: true });
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=base&base64data=encodedData&single_address=1");
  });

  it("should encode and include data if provided", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    const link = generateLink(baseParams);
    expect(link).toContain("base64data=encodedData");
  });

  it("should handle testnet configuration", async () => {
    (encodeData as any).mockImplementation(() => "encodedData");

    vi.doMock("@/appConfig", () => ({
      default: { TESTNET: true },
    }));

    const { generateLink } = await import("@/lib/generateLink"); // Re-import the module

    const link = generateLink(baseParams);
    expect(link).toBe("obyte-tn:AA_ADDRESS?amount=1000&asset=base&base64data=encodedData");
  });

  it("should handle livenet configuration", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    appConfig.TESTNET = false;
    const link = generateLink(baseParams);
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=base&base64data=encodedData");
  });

  it("should handle asset parameter if provided", () => {
    (encodeData as any).mockImplementation(() => "encodedData");
    const link = generateLink({ ...baseParams, asset: "custom_asset" });
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=custom_asset&base64data=encodedData");
  });

  it("should handle null encoded data gracefully", () => {
    (encodeData as any).mockImplementation(() => null);
    const link = generateLink(baseParams);
    expect(link).toBe("obyte:AA_ADDRESS?amount=1000&asset=base");
  });
});
