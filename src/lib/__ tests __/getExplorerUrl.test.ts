import appConfig from "@/appConfig";
import { afterEach, describe, expect, it } from "vitest";
import { getExplorerUrl } from "../getExplorerUrl";

describe("getExplorerUrl", () => {
  const originalTestnet = appConfig.TESTNET;

  afterEach(() => {
    // Restore the original TESTNET value after each test.
    appConfig.TESTNET = originalTestnet;
  });

  it("should generate a tx explorer url on mainnet", () => {
    appConfig.TESTNET = false;
    const txId = "someTxId";
    const url = getExplorerUrl(txId, "tx");
    expect(url).toBe(`https://explorer.obyte.org/${encodeURIComponent(txId)}`);
  });

  it("should generate an address explorer url on mainnet", () => {
    appConfig.TESTNET = false;
    const address = "someAddress";
    const url = getExplorerUrl(address, "address");
    expect(url).toBe(`https://explorer.obyte.org/address/${address}`);
  });

  it("should generate an asset explorer url on mainnet", () => {
    appConfig.TESTNET = false;
    const asset = "tm29c4vlsdHQo6VYHJpZXe5zmZjfQskIudo7Li3jooA=";
    const url = getExplorerUrl(asset, "asset");
    expect(url).toBe(`https://explorer.obyte.org/asset/${encodeURIComponent(asset)}`);
  });

  it("should generate a tx explorer url on testnet", () => {
    appConfig.TESTNET = true;
    const txId = "someTxId";
    const url = getExplorerUrl(txId);
    expect(url).toBe(`https://testnetexplorer.obyte.org/${encodeURIComponent(txId)}`);
  });

  it("should throw an error when an invalid type is provided", () => {
    const invalidType = "invalid" as any;
    expect(() => getExplorerUrl("value", invalidType)).toThrowError("Invalid explorer type");
  });

  it('should default to "tx" type when none is provided', () => {
    appConfig.TESTNET = false;
    const txId = "defaultTx";
    const url = getExplorerUrl(txId);
    expect(url).toBe(`https://explorer.obyte.org/${encodeURIComponent(txId)}`);
  });
});

