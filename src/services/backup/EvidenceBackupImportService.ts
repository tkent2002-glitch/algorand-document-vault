import type { EvidenceRecord } from "../notarization";
import { BackupIntegrityValidationService } from "./BackupIntegrityValidationService";
import type { IntegrityProtectedEvidenceBackupFile } from "./BackupIntegrityValidationService";

export type EvidenceBackupImportResult = {
  importedRecords: number;
  skippedExistingRecords: number;
  blockedConflictingRecords: number;
};

export class EvidenceBackupImportService {
  static async importNewRecords(
    backup: IntegrityProtectedEvidenceBackupFile,
    existingRecords: EvidenceRecord[]
  ): Promise<EvidenceBackupImportResult & { records: EvidenceRecord[] }> {
    const integrityResult = await BackupIntegrityValidationService.evaluate(backup);

    if (!integrityResult.valid) {
      throw new Error(
        integrityResult.errors.join(" ") || "Cannot import evidence backup that failed integrity validation."
      );
    }

    const existingIds = new Set(existingRecords.map((record) => record.id));
    const recordsById = new Map(
      existingRecords.map((record) => [record.id, record])
    );

    const mergedRecords = [...existingRecords];

    let importedRecords = 0;
    let skippedExistingRecords = 0;
    let blockedConflictingRecords = 0;

    for (const record of backup.records) {
      const existingRecord = recordsById.get(record.id);

      if (existingRecord && existingRecord.hashValue !== record.hashValue) {
        blockedConflictingRecords += 1;
        continue;
      }

      if (existingIds.has(record.id)) {
        skippedExistingRecords += 1;
        continue;
      }

      mergedRecords.unshift(record);
      existingIds.add(record.id);
      recordsById.set(record.id, record);
      importedRecords += 1;
    }

    return {
      importedRecords,
      skippedExistingRecords,
      blockedConflictingRecords,
      records: mergedRecords,
    };
  }
}
