import type {
  AlgorandProofTransactionDraft,
  AlgorandTransactionInspection,
} from "../../types";
import { DEFAULT_ALGORAND_NETWORK_CONFIG } from "../../types";

export class AlgorandTransactionInspectionService {
  static inspectDraft(
    draft: AlgorandProofTransactionDraft
  ): AlgorandTransactionInspection {
    return {
      network: DEFAULT_ALGORAND_NETWORK_CONFIG.network,
      transactionType: "Payment transaction with document-integrity proof note",
      amountAlgos: "0",
      estimatedFeeAlgos: "0.001",
      senderAddress: draft.senderAddress,
      receiverAddress: draft.receiverAddress,
      noteByteLength: draft.noteByteLength,
      payloadPreview: draft.notePreview,
      readiness: "ready_for_signature",
    };
  }
}
