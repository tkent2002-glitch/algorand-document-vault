import type { EvidenceRecord } from "../notarization";
import type { EvidenceBackupFile } from "./EvidenceBackupValidationService";

export type EvidenceBackupImportPreview = {
  totalRecords: number;
  newRecords: number;
  existingRecords: number;
  duplicateFingerprints: number;
  conflictingRecordIds: number;
};

export class EvidenceBackupImportPreviewService {
  static preview(
    backup: EvidenceBackupFile,
    existingRecords: EvidenceRecord[]
  ): EvidenceBackupImportPreview {
    const existingIds = new Set(existingRecords.map((record) => record.id));
    const existingRecordsById = new Map(
      existingRecords.map((record) => [record.id, record])
    );
    const existingHashes = new Set(
      existingRecords.map((record) => record.hashValue)
    );

    const backupHashes = new Map<string, number>();

    let newRecords = 0;
    let existingRecordCount = 0;
    let conflictingRecordIds = 0;

    for (const record of backup.records) {
      backupHashes.set(
        record.hashValue,
        (backupHashes.get(record.hashValue) ?? 0) + 1
      );

      if (existingIds.has(record.id)) {
        existingRecordCount += 1;
      } else {
        newRecords += 1;
      }

      const matchingExistingRecord = existingRecordsById.get(record.id);

      if (
        matchingExistingRecord &&
        matchingExistingRecord.hashValue !== record.hashValue
      ) {
        conflictingRecordIds += 1;
      }
    }

    const duplicateFingerprints = backup.records.filter((record) =>
      existingHashes.has(record.hashValue)
    ).length;

    return {
      totalRecords: backup.records.length,
      newRecords,
      existingRecords: existingRecordCount,
      duplicateFingerprints,
      conflictingRecordIds,
    };
  }
}
