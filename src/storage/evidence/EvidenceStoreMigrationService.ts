import type { EvidenceStore } from "./EvidenceStore";

export type EvidenceStoreMigrationResult = {
  sourceRecords: number;
  existingTargetRecords: number;
  migratedRecords: number;
  skippedExistingRecords: number;
  blockedConflictingRecords: number;
  finalTargetRecords: number;
};

export class EvidenceStoreMigrationService {
  static async migrate(
    source: EvidenceStore,
    target: EvidenceStore
  ): Promise<EvidenceStoreMigrationResult> {
    const sourceRecords = await source.list();
    const targetRecords = await target.list();

    const targetById = new Map(
      targetRecords.map((record) => [record.id, record])
    );

    const mergedRecords = [...targetRecords];

    let migratedRecords = 0;
    let skippedExistingRecords = 0;
    let blockedConflictingRecords = 0;

    for (const sourceRecord of sourceRecords) {
      const targetRecord = targetById.get(sourceRecord.id);

      if (
        targetRecord &&
        targetRecord.hashValue !== sourceRecord.hashValue
      ) {
        blockedConflictingRecords += 1;
        continue;
      }

      if (targetRecord) {
        skippedExistingRecords += 1;
        continue;
      }

      mergedRecords.push(sourceRecord);
      targetById.set(sourceRecord.id, sourceRecord);
      migratedRecords += 1;
    }

    if (migratedRecords > 0) {
      await target.saveAll(mergedRecords);
    }

    return {
      sourceRecords: sourceRecords.length,
      existingTargetRecords: targetRecords.length,
      migratedRecords,
      skippedExistingRecords,
      blockedConflictingRecords,
      finalTargetRecords: mergedRecords.length,
    };
  }
}
