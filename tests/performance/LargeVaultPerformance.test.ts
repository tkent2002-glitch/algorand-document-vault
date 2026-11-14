import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import {
  BackupEncryptionService,
  BackupIntegrityService,
  BackupIntegrityValidationService,
  EvidenceBackupImportPreviewService,
  EvidenceBackupImportService,
  HashService,
  type EvidenceBackupFile,
} from "../../src/services";
import type { EvidenceRecord } from "../../src/services";
import { IndexedDbEvidenceStore } from "../../src/storage/evidence/IndexedDbEvidenceStore";
import {
  buildEvidenceIndex,
  filterAndSortEvidenceIndex,
  paginateEvidenceIndex,
} from "../../src/pages/VaultPage/VaultIndex";

const LARGE_VAULT_SIZE = 10_000;
const PERFORMANCE_LIMIT_MS = 10_000;

function createRecord(index: number): EvidenceRecord {
  const hashValue = index.toString(16).padStart(64, "0");
  const createdAt = new Date(
    Date.UTC(2026, 0, 1, 0, 0, index)
  ).toISOString();

  return {
    id: `performance-record-${index}`,
    status: "draft",
    documentName: `performance-document-${index.toString().padStart(5, "0")}.pdf`,
    hashAlgorithm: "SHA-256",
    hashValue,
    proof: {
      status: "draft",
      payload: {
        appId: "algorand-document-vault",
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hashValue,
        },
      },
      createdAt,
    },
    createdAt,
  };
}

async function measure<T>(operation: () => T | Promise<T>) {
  const startedAt = performance.now();
  const result = await operation();

  return {
    durationMs: performance.now() - startedAt,
    result,
  };
}

describe("large Evidence Vault performance", () => {
  it(
    "keeps 10,000-record storage, browsing, backup, and restore operations bounded",
    async () => {
      const records = Array.from({ length: LARGE_VAULT_SIZE }, (_, index) =>
        createRecord(index)
      );

      const store = new IndexedDbEvidenceStore();
      await store.clear();

      const storageWrite = await measure(() => store.saveAll(records));
      const storageRead = await measure(() => store.list());
      const browsing = await measure(() => {
        const index = buildEvidenceIndex(storageRead.result);
        const filtered = filterAndSortEvidenceIndex(
          index,
          "performance-document-09999",
          "all",
          "newest"
        );

        return paginateEvidenceIndex(filtered, 1, 50);
      });
      const documentHashing = await measure(() =>
        HashService.sha256FromArrayBuffer(
          new ArrayBuffer(25 * 1024 * 1024)
        )
      );

      const payload: EvidenceBackupFile = {
        schema: "adv-evidence-backup-v1",
        exportedAt: "2026-08-28T00:00:00.000Z",
        recordCount: records.length,
        records,
      };

      const integrityCreation = await measure(() =>
        BackupIntegrityService.createIntegrity(payload)
      );
      const backup = {
        ...payload,
        integrity: integrityCreation.result,
      };
      const plainBackupBytes = new TextEncoder().encode(
        JSON.stringify(backup)
      ).byteLength;
      const integrityValidation = await measure(() =>
        BackupIntegrityValidationService.evaluate(backup)
      );
      const preview = await measure(() =>
        EvidenceBackupImportPreviewService.preview(backup, records)
      );
      const importResult = await measure(() =>
        EvidenceBackupImportService.importNewRecords(backup, [])
      );
      const encryption = await measure(() =>
        BackupEncryptionService.encrypt(backup, "large-vault-performance-password")
      );
      const decryption = await measure(() =>
        BackupEncryptionService.decrypt<typeof backup>(
          encryption.result,
          "large-vault-performance-password"
        )
      );

      const timings = {
        storageWrite: storageWrite.durationMs,
        storageRead: storageRead.durationMs,
        browsing: browsing.durationMs,
        documentHashing25MiB: documentHashing.durationMs,
        integrityCreation: integrityCreation.durationMs,
        integrityValidation: integrityValidation.durationMs,
        preview: preview.durationMs,
        import: importResult.durationMs,
        encryption: encryption.durationMs,
        decryption: decryption.durationMs,
      };

      console.info(
        "10,000-record performance (milliseconds):",
        JSON.stringify({
          ...timings,
          plainBackupMiB: plainBackupBytes / 1024 / 1024,
        })
      );

      expect(storageRead.result).toHaveLength(LARGE_VAULT_SIZE);
      expect(browsing.result.items).toHaveLength(1);
      expect(documentHashing.result).toHaveLength(64);
      expect(integrityValidation.result.valid).toBe(true);
      expect(preview.result.existingRecords).toBe(LARGE_VAULT_SIZE);
      expect(importResult.result.importedRecords).toBe(LARGE_VAULT_SIZE);
      expect(importResult.result.records).toHaveLength(LARGE_VAULT_SIZE);
      expect(decryption.result.recordCount).toBe(LARGE_VAULT_SIZE);
      expect(plainBackupBytes).toBeGreaterThan(1_000_000);

      for (const duration of Object.values(timings)) {
        expect(duration).toBeLessThan(PERFORMANCE_LIMIT_MS);
      }
    },
    60_000
  );
});
