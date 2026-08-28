import algosdk from "algosdk";
import { Logger } from "../../core";
import type { AlgorandNetworkConfig } from "../../types";
import { DEFAULT_ALGORAND_NETWORK_CONFIG } from "../../types";

export type AlgorandNodeStatus = {
  connected: boolean;
  network: string;
  message: string;
};

export class AlgorandService {
  private static readonly config: AlgorandNetworkConfig =
    DEFAULT_ALGORAND_NETWORK_CONFIG;

  static getNetworkConfig(): AlgorandNetworkConfig {
    return AlgorandService.config;
  }

  static createAlgodClient(): algosdk.Algodv2 {
    return new algosdk.Algodv2(
      AlgorandService.config.algodToken,
      AlgorandService.config.algodServer,
      AlgorandService.config.algodPort
    );
  }

  static async checkNodeStatus(): Promise<AlgorandNodeStatus> {
    try {
      const client = AlgorandService.createAlgodClient();
      await client.status().do();

      return {
        connected: true,
        network: AlgorandService.config.network,
        message: "Connected to Algorand node.",
      };
    } catch {
      Logger.error("Algorand node status check failed.");

      return {
        connected: false,
        network: AlgorandService.config.network,
        message: "Unable to connect to Algorand node.",
      };
    }
  }

  static getSdkStatus(): string {
    return typeof algosdk === "object"
      ? "Algorand SDK loaded"
      : "Algorand SDK unavailable";
  }

  static createTestAccountAddress(): string {
    const account = algosdk.generateAccount();
    return account.addr.toString();
  }
}


