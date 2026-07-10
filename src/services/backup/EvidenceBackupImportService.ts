import type { EvidenceRecord } from "../notarization";
import type { BackupIntegrityMetadata } from "./BackupIntegrityService";
import { BackupIntegrityService } from "./BackupIntegrityService";
import type { EvidenceBackupFile } from "./EvidenceBackupValidationService";
import { EvidenceBackupValidationService } from "./EvidenceBackupValidationService";

export type EvidenceBackupImportResult = {
  importedRecords: number;
  skippedExistingRecords: number;
  blockedConflictingRecords: number;
};

type IntegrityProtectedBackup = EvidenceBackupFile & {
  integrity?: BackupIntegrityMetadata;
};

function removeIntegrity(backup: IntegrityProtectedBackup): EvidenceBackupFile {
  const { integrity: _integrity, ...payload } = backup;
  return payload;
}

export class EvidenceBackupImportService {
  static async importNewRecords(
    backup: IntegrityProtectedBackup,
    existingRecords: EvidenceRecord[]
  ): Promise<EvidenceBackupImportResult & { records: EvidenceRecord[] }> {
    const validation = EvidenceBackupValidationService.validate(backup);

    if (!validation.valid) {
      throw new Error("Cannot import invalid evidence backup.");
    }

    if (!backup.integrity) {
      throw new Error("Backup integrity metadata is missing.");
    }

    const integrityValid = await BackupIntegrityService.verifyIntegrity(
      removeIntegrity(backup),
      backup.integrity
    );

    if (!integrityValid) {
      throw new Error("Backup integrity verification failed.");
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