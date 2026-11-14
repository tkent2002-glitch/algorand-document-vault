import { describe, expect, it } from "vitest";
import { MerkleTreeService } from "../../src/services/merkle";
import { BatchEvidenceRecordService } from "../../src/services/notarization/BatchEvidenceRecordService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";
import { MerkleShareableVerificationProofService } from "../../src/services/shareable-proof/MerkleShareableVerificationProofService";
import { VerificationLinkService } from "../../src/services/verification-link/VerificationLinkService";

const hashes = [
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
];

async function createConfirmedEvidence() {
  const tree = await MerkleTreeService.build(hashes);
  const proof = NotarizationService.createMerkleBatchProof(tree.root, tree.leafCount);
  const evidence = BatchEvidenceRecordService.createDraft(
    tree,
    hashes.map((hashValue, sourceIndex) => ({
      sourceIndex,
      documentName: `${sourceIndex}.txt`,
      size: 1,
      lastModified: 0,
      hashAlgorithm: "SHA-256" as const,
      hashValue,
    })),
    proof
  );
  return {
    batch: {
      ...evidence.batch,
      status: "confirmed" as const,
      algorandTransactionId: "A".repeat(52),
      confirmedRound: 123,
      confirmedAt: "2026-09-12T00:00:00.000Z",
    },
    member: evidence.members[0],
  };
}

describe("MerkleShareableVerificationProofService", () => {
  it("creates and validates a document-specific membership proof", async () => {
    const { batch, member } = await createConfirmedEvidence();
    const proof = await MerkleShareableVerificationProofService.create(batch, member);

    await expect(MerkleShareableVerificationProofService.validate(proof)).resolves.toMatchObject({
      valid: true,
      errors: [],
    });
  });

  it("round trips a v2 verification link without accepting a changed sibling", async () => {
    const { batch, member } = await createConfirmedEvidence();
    const url = await VerificationLinkService.createMerkleUrl(
      batch,
      member,
      "https://example.test/"
    );
    const parsed = await VerificationLinkService.parseHash(new URL(url).hash);

    expect(parsed.valid).toBe(true);
    expect(parsed.envelope?.version).toBe("adv-verification-link-v2");

    const proof = await MerkleShareableVerificationProofService.create(batch, member);
    proof.evidence.siblings[0].hash = "c".repeat(64);
    await expect(MerkleShareableVerificationProofService.validate(proof)).resolves.toMatchObject({
      valid: false,
    });
  });
});
