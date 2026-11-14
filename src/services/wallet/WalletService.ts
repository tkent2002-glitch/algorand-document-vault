import { PeraWalletConnect } from "@perawallet/connect";
import type { Transaction } from "algosdk";
import { installBrowserPolyfills } from "../../browser/installBrowserPolyfills";
import type {
  WalletConnection,
  WalletConnectionErrorReason,
} from "../../types/wallet";
import { Logger } from "../../core";

installBrowserPolyfills();

const PERA_TESTNET_CHAIN_ID = 416002;

function getPeraErrorType(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const data = (error as { data?: unknown }).data;

  if (typeof data !== "object" || data === null) {
    return undefined;
  }

  const type = (data as { type?: unknown }).type;

  return typeof type === "string" ? type : undefined;
}

function classifyConnectionError(
  error: unknown
): WalletConnectionErrorReason {
  const errorType = getPeraErrorType(error);

  if (
    errorType === "CONNECT_MODAL_CLOSED" ||
    errorType === "CONNECT_CANCELLED" ||
    errorType === "OPERATION_CANCELLED"
  ) {
    return "cancelled";
  }

  if (errorType === "CONNECT_NETWORK_MISMATCH") {
    return "network_mismatch";
  }

  if (
    errorType === "MESSAGE_NOT_RECEIVED" ||
    errorType?.startsWith("SESSION_")
  ) {
    return "session_unavailable";
  }

  return "unknown";
}

export class WalletService {
  private static pera: PeraWalletConnect | undefined;

  private static getPera(): PeraWalletConnect {
    WalletService.pera ??= new PeraWalletConnect({
      shouldShowSignTxnToast: false,
      chainId: PERA_TESTNET_CHAIN_ID,
    });

    return WalletService.pera;
  }

  static async reconnect(): Promise<WalletConnection> {
    try {
      const accounts = await WalletService.getPera().reconnectSession();

      if (accounts.length > 0) {
        return {
          status: "connected",
          address: accounts[0],
        };
      }

      return {
        status: "disconnected",
      };
    } catch {
      Logger.error("Pera Wallet session restoration failed.");

      return {
        status: "error",
      };
    }
  }

  static async connect(): Promise<WalletConnection> {
    try {
      const accounts = await WalletService.getPera().connect();

      if (accounts.length > 0) {
        return {
          status: "connected",
          address: accounts[0],
        };
      }

      return {
        status: "disconnected",
      };
    } catch (error) {
      const errorReason = classifyConnectionError(error);

      Logger.error(
        `Pera Wallet connection failed (${errorReason}).`
      );

      return {
        status: "error",
        errorReason,
      };
    }
  }

  static async disconnect(): Promise<WalletConnection> {
    try {
      await WalletService.getPera().disconnect();

      return {
        status: "disconnected",
      };
    } catch {
      Logger.error("Pera Wallet disconnection failed.");

      return {
        status: "error",
      };
    }
  }

  static isConnected(): boolean {
    return WalletService.getPera().isConnected;
  }

  static async signSingleTransaction(
    transaction: Transaction
  ): Promise<Uint8Array> {
    const signedTransactions =
      await WalletService.getPera().signTransaction([
        [{ txn: transaction }],
      ]);

    return signedTransactions[0];
  }
}
