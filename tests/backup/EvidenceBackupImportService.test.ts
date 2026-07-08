import { describe, expect, it } from "vitest";
import { EvidenceBackupImportService } from "../../src/services/backup/EvidenceBackupImportService";
import type { EvidenceRecord } from "../../src/services";

const hashA =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

const hashB =
  "486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7";

function createRecord(id: string, hashValue: string): EvidenceRecord {
  return {
    id,
    status: "draft",
    documentName: `${id}.txt`,
    hashAlgorithm: "SHA-256",
    hashValue,
    proof: {
      id: `proof-${id}`,
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hashValue,
        },
        createdAt: "2026-07-08T00:00:00.000Z",
      },
      createdAt: "2026-07-08T00:00:00.000Z",
    },
    createdAt: "2026-07-08T00:00:00.000Z",
  };
}

describe("EvidenceBackupImportService", () => {
  it("imports new records", () => {
    const backup = {
      schema: "adv-evidence-backup-v1" as const,
      exportedAt: "2026-07-08T00:00:00.000Z",
      recordCount: 1,
      records: [createRecord("record-1", hashA)],
    };

    const result = EvidenceBackupImportService.importNewRecords(backup, []);

    expect(result.importedRecords).toBe(1);
    expect(result.skippedExistingRecords).toBe(0);
    expect(result.blockedConflictingRecords).toBe(0);
    expect(result.records).toHaveLength(1);
  });

  it("skips existing records with the same id", () => {
    const existing = createRecord("record-1", hashA);

    const backup = {
      schema: "adv-evidence-backup-v1" as const,
      exportedAt: "2026-07-08T00:00:00.000Z",
      recordCount: 1,
      records: [existing],
    };

    const result = EvidenceBackupImportService.importNewRecords(backup, [existing]);

    expect(result.importedRecords).toBe(0);
    expect(result.skippedExistingRecords).toBe(1);
    expect(result.blockedConflictingRecords).toBe(0);
    expect(result.records).toHaveLength(1);
  });

  it("blocks conflicting records with same id but different hash", () => {
    const existing = createRecord("record-1", hashA);
    const conflicting = createRecord("record-1", hashB);

    const backup = {
      schema: "adv-evidence-backup-v1" as const,
      exportedAt: "2026-07-08T00:00:00.000Z",
      recordCount: 1,
      records: [conflicting],
    };

    const result = EvidenceBackupImportService.importNewRecords(backup, [existing]);

    expect(result.importedRecords).toBe(0);
    expect(result.skippedExistingRecords).toBe(0);
    expect(result.blockedConflictingRecords).toBe(1);
    expect(result.records).toEqual([existing]);
  });
});
