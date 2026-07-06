import algosdk from "algosdk";
import type { NotarizationProof } from "../../types";

export class AlgorandService {
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
