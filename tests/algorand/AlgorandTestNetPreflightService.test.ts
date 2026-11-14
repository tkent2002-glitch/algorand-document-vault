import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlgorandService } from "../../src/services/algorand/AlgorandService";
import { AlgorandTestNetPreflightService } from "../../src/services/algorand/AlgorandTestNetPreflightService";
import { WalletService } from "../../src/services/wallet/WalletService";

describe("AlgorandTestNetPreflightService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reports ready when TestNet, node, and wallet are available", async () => {
    vi.spyOn(
      AlgorandService,
      "getNetworkConfig"
    ).mockReturnValue({
      network: "testnet",
      algodServer: "https://testnet-api.algonode.cloud",
      algodPort: "",
      algodToken: "",
    });

    vi.spyOn(
      AlgorandService,
      "checkNodeStatus"
    ).mockResolvedValue({
      connected: true,
      network: "testnet",
      message: "Connected to Algorand node.",
    });

    vi.spyOn(
      WalletService,
      "reconnect"
    ).mockResolvedValue({
      status: "connected",
      address:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
    });

    const result =
      await AlgorandTestNetPreflightService.evaluate();

    expect(result.ready).toBe(true);
    expect(result.network).toBe("testnet");
    expect(result.nodeConnected).toBe(true);
    expect(result.walletConnected).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("blocks readiness when the node is unavailable", async () => {
    vi.spyOn(
      AlgorandService,
      "checkNodeStatus"
    ).mockResolvedValue({
      connected: false,
      network: "testnet",
      message: "Unable to connect to Algorand node.",
    });

    vi.spyOn(
      WalletService,
      "reconnect"
    ).mockResolvedValue({
      status: "connected",
      address:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
    });

    const result =
      await AlgorandTestNetPreflightService.evaluate();

    expect(result.ready).toBe(false);
    expect(result.nodeConnected).toBe(false);
    expect(result.errors).toContain(
      "The configured Algorand node could not be reached."
    );
  });

  it("blocks readiness when no wallet session exists", async () => {
    vi.spyOn(
      AlgorandService,
      "checkNodeStatus"
    ).mockResolvedValue({
      connected: true,
      network: "testnet",
      message: "Connected to Algorand node.",
    });

    vi.spyOn(
      WalletService,
      "reconnect"
    ).mockResolvedValue({
      status: "disconnected",
    });

    const result =
      await AlgorandTestNetPreflightService.evaluate();

    expect(result.ready).toBe(false);
    expect(result.walletConnected).toBe(false);
    expect(result.walletAddress).toBeNull();
    expect(result.errors).toContain(
      "A connected Pera Wallet TestNet account is required."
    );
  });

  it("blocks readiness outside TestNet", async () => {
    vi.spyOn(
      AlgorandService,
      "getNetworkConfig"
    ).mockReturnValue({
      network: "mainnet",
      algodServer: "https://mainnet-api.algonode.cloud",
      algodPort: "",
      algodToken: "",
    });

    vi.spyOn(
      AlgorandService,
      "checkNodeStatus"
    ).mockResolvedValue({
      connected: true,
      network: "mainnet",
      message: "Connected to Algorand node.",
    });

    vi.spyOn(
      WalletService,
      "reconnect"
    ).mockResolvedValue({
      status: "connected",
      address:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
    });

    const result =
      await AlgorandTestNetPreflightService.evaluate();

    expect(result.ready).toBe(false);
    expect(
      result.checks.networkConfiguredForTestNet
    ).toBe(false);
    expect(result.errors).toContain(
      "The application is not configured for Algorand TestNet."
    );
  });
});
