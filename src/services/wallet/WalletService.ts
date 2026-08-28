import { PeraWalletConnect } from "@perawallet/connect";
import type { Transaction } from "algosdk";
import { installBrowserPolyfills } from "../../browser/installBrowserPolyfills";
import type { WalletConnection } from "../../types/wallet";
import { Logger } from "../../core";

installBrowserPolyfills();

export class WalletService {
  private static pera: PeraWalletConnect | undefined;

  private static getPera(): PeraWalletConnect {
    WalletService.pera ??= new PeraWalletConnect({
      shouldShowSignTxnToast: false,
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
    } catch {
      Logger.error("Pera Wallet connection failed.");

      return {
        status: "error",
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
