import { describe, expect, it } from "vitest";
import { BackupIntegrityService } from "../../src/services/backup/BackupIntegrityService";
import { BackupTrustService } from "../../src/services/backup/BackupTrustService";
import { EvidenceBackupImportService } from "../../src/services/backup/EvidenceBackupImportService";
import { BackupEncryptionService } from "../../src/services/security/BackupEncryptionService";
import type { TrustedEvidenceBackupFile } from "../../src/services/backup/BackupTrustService";
import type { EvidenceRecord } from "../../src/services";

const documentHash =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

function createEvidenceRecord(): EvidenceRecord {
  return {
    id: "encrypted-recovery-record-1",
    status: "confirmed",
    documentName: "recovery-test.txt",
    hashAlgorithm: "SHA-256",
    hashValue: documentHash,
    proof: {
      id: "encrypted-recovery-proof-1",
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: documentHash,
        },
        createdAt: "2026-07-10T00:00:00.000Z",
      },
      createdAt: "2026-07-10T00:00:00.000Z",
    },
    algorandTransactionId: "TESTTRANSACTION123",
    submittedAt: "2026-07-10T00:01:00.000Z",
    confirmedRound: 123456,
    confirmedAt: "2026-07-10T00:02:00.000Z",
    createdAt: "2026-07-10T00:00:00.000Z",
  };
}

async function createTrustedBackup(): Promise<TrustedEvidenceBackupFile> {
  const payload = {
    schema: "adv-evidence-backup-v1" as const,
    exportedAt: "2026-07-10T01:00:00.000Z",
    recordCount: 1,
    records: [createEvidenceRecord()],
  };

  return {
    ...payload,
    integrity: await BackupIntegrityService.createIntegrity(payload),
  };
}

describe("Encrypted backup recovery pipeline", () => {
  it("decrypts, verifies, and imports a trusted backup", async () => {
    const originalBackup = await createTrustedBackup();

    const encryptedBackup = await BackupEncryptionService.encrypt(
      originalBackup,
      "integration-test-password"
    );

    const decryptedBackup =
      await BackupEncryptionService.decrypt<TrustedEvidenceBackupFile>(
        encryptedBackup,
        "integration-test-password"
      );

    const trustResult = await BackupTrustService.evaluate(decryptedBackup);

    expect(trustResult.trusted).toBe(true);
    expect(trustResult.structureValid).toBe(true);
    expect(trustResult.integrityVerified).toBe(true);

    const importResult =
      await EvidenceBackupImportService.importNewRecords(
        decryptedBackup,
        []
      );

    expect(importResult.importedRecords).toBe(1);
    expect(importResult.skippedExistingRecords).toBe(0);
    expect(importResult.blockedConflictingRecords).toBe(0);
    expect(importResult.records).toEqual(originalBackup.records);
  });

  it("blocks recovery when the encrypted backup password is incorrect", async () => {
    const originalBackup = await createTrustedBackup();

    const encryptedBackup = await BackupEncryptionService.encrypt(
      originalBackup,
      "correct-integration-password"
    );

    await expect(
      BackupEncryptionService.decrypt(
        encryptedBackup,
        "incorrect-integration-password"
      )
    ).rejects.toThrow(
      "Backup decryption failed. The password may be incorrect or the file may be corrupted."
    );
  });

  it("blocks import when decrypted backup integrity is invalid", async () => {
    const originalBackup = await createTrustedBackup();

    const modifiedBackup: TrustedEvidenceBackupFile = {
      ...originalBackup,
      records: [
        {
          ...originalBackup.records[0],
          documentName: "modified-after-integrity.txt",
        },
      ],
    };

    const encryptedBackup = await BackupEncryptionService.encrypt(
      modifiedBackup,
      "integrity-test-password"
    );

    const decryptedBackup =
      await BackupEncryptionService.decrypt<TrustedEvidenceBackupFile>(
        encryptedBackup,
        "integrity-test-password"
      );

    const trustResult = await BackupTrustService.evaluate(decryptedBackup);

    expect(trustResult.trusted).toBe(false);
    expect(trustResult.integrityVerified).toBe(false);

    await expect(
      EvidenceBackupImportService.importNewRecords(
        decryptedBackup,
        []
      )
    ).rejects.toThrow("Backup integrity verification failed.");
  });
});
