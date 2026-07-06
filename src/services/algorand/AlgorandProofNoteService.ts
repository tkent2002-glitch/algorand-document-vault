import type { NotarizationProof } from "../../types";
import { ProofPayloadSerializer } from "../notarization";

const MAX_ALGORAND_NOTE_BYTES = 1024;

export class AlgorandProofNoteService {
  static createNote(proof: NotarizationProof): Uint8Array {
    const serializedPayload = ProofPayloadSerializer.serialize(proof);
    const note = new TextEncoder().encode(serializedPayload);

    if (note.byteLength > MAX_ALGORAND_NOTE_BYTES) {
      throw new Error("Proof payload exceeds Algorand note size limit.");
    }

    return note;
  }

  static createPreview(proof: NotarizationProof): string {
    return ProofPayloadSerializer.serialize(proof);
  }
}
