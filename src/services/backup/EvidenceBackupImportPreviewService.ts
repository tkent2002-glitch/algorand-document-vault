import type { EvidenceRecord } from "../notarization";
import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../notarization/BatchEvidenceRecordService";
import type { EvidenceBackupFile } from "./EvidenceBackupValidationService";

export type EvidenceBackupImportPreview = {
  totalRecords: number;
  newRecords: number;
  existingRecords: number;
  duplicateFingerprints: number;
  conflictingRecordIds: number;
  totalBatches: number;
  newBatches: number;
  existingBatches: number;
  conflictingBatchIds: number;
};

export class EvidenceBackupImportPreviewService {
  static preview(
    backup: EvidenceBackupFile,
    existingRecords: EvidenceRecord[],
    existingBatches: BatchEvidenceRecord[] = [],
    existingMembers: BatchEvidenceMemberRecord[] = []
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

    const backupBatches = backup.schema === "adv-evidence-backup-v2"
      ? backup.batches
      : [];
    const existingBatchById = new Map(
      existingBatches.map((batch) => [batch.id, batch])
    );
    let conflictingBatchIds = backupBatches.filter((batch) => {
      const existing = existingBatchById.get(batch.id);
      return Boolean(existing && existing.merkleRoot !== batch.merkleRoot);
    }).length;
    const existingBatchCount = backupBatches.filter((batch) =>
      existingBatchById.has(batch.id)
    ).length;

    if (backup.schema === "adv-evidence-backup-v2") {
      const existingMemberById = new Map(
        existingMembers.map((member) => [member.id, member])
      );
      if (
        backup.batchMembers.some((member) => {
          const existing = existingMemberById.get(member.id);
          return Boolean(
            existing &&
            (existing.batchId !== member.batchId ||
              existing.hashValue !== member.hashValue ||
              existing.leafIndex !== member.leafIndex)
          );
        })
      ) {
        conflictingBatchIds += 1;
      }
    }

    return {
      totalRecords: backup.records.length,
      newRecords,
      existingRecords: existingRecordCount,
      duplicateFingerprints,
      conflictingRecordIds,
      totalBatches: backupBatches.length,
      newBatches: backupBatches.length - existingBatchCount,
      existingBatches: existingBatchCount,
      conflictingBatchIds,
    };
  }
}
