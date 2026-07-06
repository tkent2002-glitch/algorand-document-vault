import algosdk from "algosdk";
import type { AlgorandNetworkConfig, NotarizationProof } from "../../types";
import { DEFAULT_ALGORAND_NETWORK_CONFIG } from "../../types";

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

  static getSdkStatus(): string {
    return typeof algosdk === "object"
      ? "Algorand SDK loaded"
      : "Algorand SDK unavailable";
  }

  static createTestAccountAddress(): string {
    const account = algosdk.generateAccount();
    return account.addr.toString();
  }

  static async submitProof(
    proof: NotarizationProof
  ): Promise<NotarizationProof> {
    console.log("Algorand submission placeholder", proof);

    return {
      ...proof,
      status: "pending_wallet_signature",
    };
  }
}
