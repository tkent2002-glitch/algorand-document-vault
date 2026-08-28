import { describe, expect, it } from "vitest";
import { BackupIntegrityService } from "../../src/services/backup/BackupIntegrityService";
import {
  BackupIntegrityValidationService,
  type IntegrityProtectedEvidenceBackupFile,
} from "../../src/services/backup/BackupIntegrityValidationService";
import type { EvidenceRecord } from "../../src/services";

const hash =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

function createRecord(): EvidenceRecord {
  return {
    id: "record-1",
    status: "draft",
    documentName: "test.txt",
    hashAlgorithm: "SHA-256",
    hashValue: hash,
    proof: {
      id: "proof-record-1",
      status: "draft",
      payload: {
        appId: "algorand-document-vault",
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hash,
        },
        createdAt: "2026-07-09T00:00:00.000Z",
      },
      createdAt: "2026-07-09T00:00:00.000Z",
    },
    createdAt: "2026-07-09T00:00:00.000Z",
  };
}

async function createIntegrityProtectedBackup(): Promise<IntegrityProtectedEvidenceBackupFile> {
  const payload = {
    schema: "adv-evidence-backup-v1" as const,
    exportedAt: "2026-07-09T01:00:00.000Z",
    recordCount: 1,
    records: [createRecord()],
  };

  return {
    ...payload,
    integrity: await BackupIntegrityService.createIntegrity(payload),
  };
}

describe("BackupIntegrityValidationService", () => {
  it("accepts a structurally valid backup with verified integrity", async () => {
    const backup = await createIntegrityProtectedBackup();

    const result = await BackupIntegrityValidationService.evaluate(backup);

    expect(result.valid).toBe(true);
    expect(result.structureValid).toBe(true);
    expect(result.integrityPresent).toBe(true);
    expect(result.integrityVerified).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a backup without integrity metadata", async () => {
    const backup: IntegrityProtectedEvidenceBackupFile = {
      schema: "adv-evidence-backup-v1",
      exportedAt: "2026-07-09T01:00:00.000Z",
      recordCount: 1,
      records: [createRecord()],
    };

    const result = await BackupIntegrityValidationService.evaluate(backup);

    expect(result.valid).toBe(false);
    expect(result.structureValid).toBe(true);
    expect(result.integrityPresent).toBe(false);
    expect(result.integrityVerified).toBe(false);
    expect(result.errors).toContain(
      "Backup integrity metadata is missing."
    );
  });

  it("rejects a backup modified after its digest was created", async () => {
    const backup = await createIntegrityProtectedBackup();

    backup.records[0] = {
      ...backup.records[0],
      documentName: "modified.txt",
    };

    const result = await BackupIntegrityValidationService.evaluate(backup);

    expect(result.valid).toBe(false);
    expect(result.structureValid).toBe(true);
    expect(result.integrityPresent).toBe(true);
    expect(result.integrityVerified).toBe(false);
    expect(result.errors).toContain(
      "Backup integrity verification failed."
    );
  });

  it("rejects an unsupported integrity algorithm", async () => {
    const backup = await createIntegrityProtectedBackup();

    const unsupportedBackup = {
      ...backup,
      integrity: {
        algorithm: "MD5",
        digest: backup.integrity?.digest ?? "",
      },
    } as unknown as IntegrityProtectedEvidenceBackupFile;

    const result = await BackupIntegrityValidationService.evaluate(unsupportedBackup);

    expect(result.valid).toBe(false);
    expect(result.integrityPresent).toBe(true);
    expect(result.integrityVerified).toBe(false);
    expect(result.errors).toContain(
      "Backup integrity verification failed."
    );
  });
});




