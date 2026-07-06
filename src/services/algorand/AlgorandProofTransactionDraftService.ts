import type {
  AlgorandProofTransactionDraft,
  NotarizationProof,
} from "../../types";
import { AlgorandProofNoteService } from "./AlgorandProofNoteService";

const MINIMUM_ALGORAND_FEE_MICROALGOS = 1000;

export class AlgorandProofTransactionDraftService {
  static createDraft(
    proof: NotarizationProof,
    senderAddress: string
  ): AlgorandProofTransactionDraft {
    const note = AlgorandProofNoteService.createNote(proof);
    const notePreview = AlgorandProofNoteService.createPreview(proof);

    return {
      senderAddress,
      receiverAddress: senderAddress,
      notePreview,
      noteByteLength: note.byteLength,
      minimumFeeMicroAlgos: MINIMUM_ALGORAND_FEE_MICROALGOS,
    };
  }
}
