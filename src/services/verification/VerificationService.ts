import type { DocumentHash, VerificationProof } from "../../types";

export class VerificationService {
  static compareHashes(expectedHash: DocumentHash, actualHash: DocumentHash): VerificationProof {
    const hashesMatch =
      expectedHash.algorithm === actualHash.algorithm &&
      expectedHash.value === actualHash.value;

    return {
      status: hashesMatch ? "hash_match" : "hash_mismatch",
      payload: {
        appId: "algorand-document-vault",
        schemaVersion: "1.0",
        hash: expectedHash,
      },
      checkedAt: new Date().toISOString(),
      message: hashesMatch
        ? "The uploaded document matches the notarized hash."
        : "The uploaded document does not match the notarized hash.",
    };
  }
}
