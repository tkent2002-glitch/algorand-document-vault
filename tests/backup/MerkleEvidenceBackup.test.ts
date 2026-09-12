import { describe, expect, it } from "vitest";
import { BackupIntegrityService } from "../../src/services/backup/BackupIntegrityService";
import { BackupIntegrityValidationService } from "../../src/services/backup/BackupIntegrityValidationService";
import { EvidenceBackupValidationService } from "../../src/services/backup/EvidenceBackupValidationService";
import { MerkleTreeService } from "../../src/services/merkle";
import { BatchEvidenceRecordService } from "../../src/services/notarization/BatchEvidenceRecordService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";

const hashes = [
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
];

async function createBackup() {
  const tree = await MerkleTreeService.build(hashes);
  const proof = NotarizationService.createMerkleBatchProof(
    tree.root,
    tree.leafCount
  );
  const draft = BatchEvidenceRecordService.createDraft(
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
  const payload = {
    schema: "adv-evidence-backup-v2" as const,
    exportedAt: "2026-09-12T00:00:00.000Z",
    recordCount: 0,
    records: [],
    batchCount: 1,
    batches: [draft.batch],
    batchMemberCount: draft.members.length,
    batchMembers: draft.members,
  };

  return {
    ...payload,
    integrity: await BackupIntegrityService.createIntegrity(payload),
  };
}

describe("Merkle evidence backup", () => {
  it("accepts a v2 backup whose membership proofs reconstruct the batch root", async () => {
    const backup = await createBackup();

    expect(EvidenceBackupValidationService.validate(backup)).toEqual({
      valid: true,
      errors: [],
    });
    await expect(BackupIntegrityValidationService.evaluate(backup)).resolves.toMatchObject({
      valid: true,
      integrityVerified: true,
    });
  });

  it("rejects a recomputed backup integrity tag when a membership proof is false", async () => {
    const backup = await createBackup();
    backup.batchMembers[0].membershipProof.siblings[0].hash =
      "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
    const payload = { ...backup };
    delete (payload as { integrity?: unknown }).integrity;
    const tampered = {
      ...payload,
      integrity: await BackupIntegrityService.createIntegrity(payload),
    };

    const result = await BackupIntegrityValidationService.evaluate(tampered);

    expect(result.valid).toBe(false);
    expect(result.integrityVerified).toBe(true);
    expect(result.errors).toContain(
      "One or more Merkle membership proofs failed verification."
    );
  });
});
