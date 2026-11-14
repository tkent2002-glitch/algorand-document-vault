import type { EvidenceRecord } from "../notarization";
import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../notarization/BatchEvidenceRecordService";
import { BackupIntegrityValidationService } from "./BackupIntegrityValidationService";
import type { IntegrityProtectedEvidenceBackupFile } from "./BackupIntegrityValidationService";

export type EvidenceBackupImportResult = {
  importedRecords: number;
  skippedExistingRecords: number;
  blockedConflictingRecords: number;
};

export class EvidenceBackupImportService {
  static async selectNewBatches(
    backup: IntegrityProtectedEvidenceBackupFile,
    existingBatches: BatchEvidenceRecord[],
    existingMembers: BatchEvidenceMemberRecord[]
  ): Promise<{
    batches: Array<{
      batch: BatchEvidenceRecord;
      members: BatchEvidenceMemberRecord[];
    }>;
    importedBatches: number;
    skippedExistingBatches: number;
    blockedConflictingBatches: number;
  }> {
    const integrityResult = await BackupIntegrityValidationService.evaluate(backup);
    if (!integrityResult.valid) {
      throw new Error(integrityResult.errors.join(" "));
    }
    if (backup.schema === "adv-evidence-backup-v1") {
      return {
        batches: [],
        importedBatches: 0,
        skippedExistingBatches: 0,
        blockedConflictingBatches: 0,
      };
    }

    const existingById = new Map(existingBatches.map((batch) => [batch.id, batch]));
    const existingMemberById = new Map(existingMembers.map((member) => [member.id, member]));
    const selected: Array<{
      batch: BatchEvidenceRecord;
      members: BatchEvidenceMemberRecord[];
    }> = [];
    let skippedExistingBatches = 0;
    let blockedConflictingBatches = 0;

    for (const batch of backup.batches) {
      const existing = existingById.get(batch.id);
      const members = backup.batchMembers.filter((member) => member.batchId === batch.id);
      const memberConflict = members.some((member) => {
        const current = existingMemberById.get(member.id);
        return Boolean(
          current &&
          (current.batchId !== member.batchId ||
            current.hashValue !== member.hashValue ||
            current.leafIndex !== member.leafIndex)
        );
      });

      if (memberConflict || (existing && existing.merkleRoot !== batch.merkleRoot)) {
        blockedConflictingBatches += 1;
      } else if (existing) {
        skippedExistingBatches += 1;
      } else {
        selected.push({ batch, members });
      }
    }

    return {
      batches: selected,
      importedBatches: selected.length,
      skippedExistingBatches,
      blockedConflictingBatches,
    };
  }

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

    const recordsToImport: EvidenceRecord[] = [];

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

      recordsToImport.push(record);
      existingIds.add(record.id);
      recordsById.set(record.id, record);
      importedRecords += 1;
    }

    return {
      importedRecords,
      skippedExistingRecords,
      blockedConflictingRecords,
      records: [...recordsToImport.reverse(), ...existingRecords],
    };
  }
}
