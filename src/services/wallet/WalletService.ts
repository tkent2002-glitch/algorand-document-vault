import { PeraWalletConnect } from "@perawallet/connect";
import type { WalletConnection } from "../../types/wallet";

export class WalletService {
  private static readonly pera = new PeraWalletConnect({
    shouldShowSignTxnToast: false,
  });

  static async reconnect(): Promise<WalletConnection> {
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
      console.error("Pera Wallet connection failed:", error);

      return {
        status: "error",
      };
    }
  }

  static async disconnect(): Promise<WalletConnection> {
    await WalletService.pera.disconnect();

    return {
      status: "disconnected",
    };
  }

  static isConnected(): boolean {
    return WalletService.pera.isConnected;
  }
}
