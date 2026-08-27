import algosdk from "algosdk";
import type {
  AlgorandUnsignedProofTransaction,
  NotarizationProof,
} from "../../types";
import { AlgorandProofNoteService } from "./AlgorandProofNoteService";
import { AlgorandService } from "./AlgorandService";

const PROOF_TRANSACTION_AMOUNT_MICROALGOS = 0;

export class AlgorandTransactionBuilderService {
  static async buildUnsignedProofTransaction(
    proof: NotarizationProof,
    senderAddress: string
  ): Promise<AlgorandUnsignedProofTransaction> {
    const client = AlgorandService.createAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();

    const note = AlgorandProofNoteService.createNote(proof);
    const notePreview = AlgorandProofNoteService.createPreview(proof);

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: senderAddress,
      amount: PROOF_TRANSACTION_AMOUNT_MICROALGOS,
      note,
      suggestedParams,
    });

    return {
      txId: transaction.txID(),
      senderAddress,
      receiverAddress: senderAddress,
      amountMicroAlgos: PROOF_TRANSACTION_AMOUNT_MICROALGOS,
      notePreview,
      noteByteLength: note.byteLength,
    };
  }
}

