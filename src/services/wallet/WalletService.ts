import { PeraWalletConnect } from "@perawallet/connect";
import type { Transaction } from "algosdk";
import type { WalletConnection } from "../../types/wallet";
import { Logger } from "../../core";

export class WalletService {
  private static readonly pera = new PeraWalletConnect({
    shouldShowSignTxnToast: false,
  });

  static async reconnect(): Promise<WalletConnection> {
    try {
      const accounts = await WalletService.pera.reconnectSession();

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
      Logger.error("Pera Wallet session restoration failed.");

      return {
        status: "error",
      };
    }
  }

  static async connect(): Promise<WalletConnection> {
    try {
      const accounts = await WalletService.pera.connect();

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
      Logger.error("Pera Wallet connection failed.");

      return {
        status: "error",
      };
    }
  }

  static async disconnect(): Promise<WalletConnection> {
    try {
      await WalletService.pera.disconnect();

      return {
        status: "disconnected",
      };
    } catch (error) {
      Logger.error("Pera Wallet disconnection failed.");

      return {
        status: "error",
      };
    }
  }

  static isConnected(): boolean {
    return WalletService.pera.isConnected;
  }

  static async signSingleTransaction(
    transaction: Transaction
  ): Promise<Uint8Array> {
    const signedTransactions = await WalletService.pera.signTransaction([
      [{ txn: transaction }],
    ]);

    return signedTransactions[0];
  }
}
