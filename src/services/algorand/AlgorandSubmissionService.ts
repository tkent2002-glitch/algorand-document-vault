import type { AlgorandSubmissionResult } from "../../types";
import { AlgorandService } from "./AlgorandService";

export class AlgorandSubmissionService {
  static async submitSignedTransaction(
    signedTransaction: Uint8Array
  ): Promise<AlgorandSubmissionResult> {
    const client = AlgorandService.createAlgodClient();
    const response = await client.sendRawTransaction(signedTransaction).do();

    return {
      transactionId: response.txid,
      submittedAt: new Date().toISOString(),
    };
  }
}
