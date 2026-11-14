import { describe, expect, it } from "vitest";
import { AlgorandProofNoteService } from "../../src/services/algorand";
import {
  NotarizationService,
  ProofPayloadSerializer,
} from "../../src/services/notarization";

const ROOT = "39e93c0fad3ed0a9a77376e3acabce8dfea503e231bac3c69555f6400897060a";

describe("Merkle batch anchoring proof", () => {
  it("serializes the canonical Version 2 Algorand note", () => {
    const proof = NotarizationService.createMerkleBatchProof(ROOT, 500);

    expect(ProofPayloadSerializer.serialize(proof)).toBe(
      `{"schema":"adv-proof-v2","proofType":"merkle-batch","hashAlgorithm":"SHA-256","treeAlgorithm":"adv-merkle-sha256-v1","root":"${ROOT}","leafCount":500}`
    );
  });

  it("fits comfortably within the Algorand note limit", () => {
    const proof = NotarizationService.createMerkleBatchProof(ROOT, 1_000);

    expect(AlgorandProofNoteService.createNote(proof).byteLength).toBeLessThan(
      1_024
    );
  });

  it("does not change Version 1 serialization", () => {
    const proof = NotarizationService.createProof({
      algorithm: "SHA-256",
      value: ROOT,
    });

    expect(ProofPayloadSerializer.serialize(proof)).toBe(
      `{"schema":"adv-proof-v1","proofType":"document-integrity","hashAlgorithm":"SHA-256","hash":"${ROOT}"}`
    );
  });

  it("rejects malformed roots and unsupported leaf counts", () => {
    expect(() =>
      NotarizationService.createMerkleBatchProof("ABC", 1)
    ).toThrow();
    expect(() =>
      NotarizationService.createMerkleBatchProof(ROOT, 1_001)
    ).toThrow();
  });
});
