import { EvidenceRepository } from "../../repositories";
import { BatchEvidenceRepository } from "../../repositories/evidence/BatchEvidenceRepository";
import { BackupIntegrityService } from "./BackupIntegrityService";
import type { MerkleEvidenceBackupFile } from "./EvidenceBackupValidationService";

export class EvidenceBackupExportService {
  static async createIntegrityProtectedBackup() {
    const [records, batches] = await Promise.all([
      EvidenceRepository.listAsync(),
      BatchEvidenceRepository.listBatchesAsync(),
    ]);
    const batchMembers = (
      await Promise.all(
        batches.map((batch) => BatchEvidenceRepository.listMembersAsync(batch.id))
      )
    ).flat();

    const payload: MerkleEvidenceBackupFile = {
      schema: "adv-evidence-backup-v2",
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records,
      batchCount: batches.length,
      batches,
      batchMemberCount: batchMembers.length,
      batchMembers,
    };

    return {
      ...payload,
      integrity: await BackupIntegrityService.createIntegrity(payload),
    };
  }
}
