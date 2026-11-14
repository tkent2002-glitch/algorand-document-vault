import { beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../src/core";
import { WalletService } from "../../src/services/wallet/WalletService";

const peraMocks = vi.hoisted(() => ({
  constructorOptions: [] as unknown[],
  connect: vi.fn(),
  reconnectSession: vi.fn(),
  disconnect: vi.fn(),
  signTransaction: vi.fn(),
}));

vi.mock("@perawallet/connect", () => ({
  PeraWalletConnect: class {
    isConnected = false;

    constructor(options: unknown) {
      peraMocks.constructorOptions.push(options);
    }

    connect() {
      return peraMocks.connect();
    }

    reconnectSession() {
      return peraMocks.reconnectSession();
    }

    disconnect() {
      return peraMocks.disconnect();
    }

    signTransaction() {
      return peraMocks.signTransaction();
    }
  },
}));

describe("WalletService", () => {
  beforeEach(() => {
    (
      WalletService as unknown as {
        pera: unknown;
      }
    ).pera = undefined;

    peraMocks.constructorOptions.length = 0;
    peraMocks.connect.mockReset();
    peraMocks.reconnectSession.mockReset();
    peraMocks.disconnect.mockReset();
    peraMocks.signTransaction.mockReset();

    peraMocks.connect.mockResolvedValue([]);
    peraMocks.reconnectSession.mockResolvedValue([]);
    peraMocks.disconnect.mockResolvedValue(undefined);
    peraMocks.signTransaction.mockResolvedValue([]);
  });

  it("configures Pera Wallet for Algorand TestNet", async () => {
    await WalletService.reconnect();

    expect(peraMocks.constructorOptions).toEqual([
      {
        shouldShowSignTxnToast: false,
        chainId: 416002,
      },
    ]);
  });

  it("classifies a WalletConnect session failure without logging its details", async () => {
    const logger = vi
      .spyOn(Logger, "error")
      .mockImplementation(() => undefined);

    peraMocks.connect.mockRejectedValue({
      data: {
        type: "SESSION_CONNECT",
        detail: "walletconnect-session-secret",
      },
    });

    await expect(WalletService.connect()).resolves.toEqual({
      status: "error",
      errorReason: "session_unavailable",
    });

    expect(logger).toHaveBeenCalledWith(
      "Pera Wallet connection failed (session_unavailable)."
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      "walletconnect-session-secret"
    );
  });

  it("distinguishes a network mismatch from a cancelled connection", async () => {
    peraMocks.connect.mockRejectedValueOnce({
      data: { type: "CONNECT_NETWORK_MISMATCH" },
    });

    await expect(WalletService.connect()).resolves.toEqual({
      status: "error",
      errorReason: "network_mismatch",
    });

    peraMocks.connect.mockRejectedValueOnce({
      data: { type: "CONNECT_MODAL_CLOSED" },
    });

    await expect(WalletService.connect()).resolves.toEqual({
      status: "error",
      errorReason: "cancelled",
    });
  });
});
