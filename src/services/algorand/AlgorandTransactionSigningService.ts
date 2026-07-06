import algosdk from "algosdk";
import type {
  AlgorandSignedProofTransaction,
  NotarizationProof,
} from "../../types";
import { WalletService } from "../wallet/WalletService";
import { AlgorandProofNoteService } from "./AlgorandProofNoteService";
import { AlgorandService } from "./AlgorandService";

const PROOF_TRANSACTION_AMOUNT_MICROALGOS = 0;

export class AlgorandTransactionSigningService {
  static async signProofTransaction(
    proof: NotarizationProof,
    senderAddress: string
  ): Promise<AlgorandSignedProofTransaction> {
    const client = AlgorandService.createAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();

    const note = AlgorandProofNoteService.createNote(proof);

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: senderAddress,
      amount: PROOF_TRANSACTION_AMOUNT_MICROALGOS,
      note,
      suggestedParams,
    } as any);

    const signedTransaction =
      await WalletService.signSingleTransaction(transaction);

    return {
      txId: transaction.txID(),
      signedTransactionByteLength: signedTransaction.byteLength,
      signedAt: new Date().toISOString(),
    };
  }
}
