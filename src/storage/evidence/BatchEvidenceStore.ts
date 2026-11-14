import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../../services/notarization/BatchEvidenceRecordService";

export interface BatchEvidenceStore {
  listBatches(): Promise<BatchEvidenceRecord[]>;
  listMembers(batchId: string): Promise<BatchEvidenceMemberRecord[]>;
  findMembersByHash(hashValue: string): Promise<BatchEvidenceMemberRecord[]>;
  saveBatch(
    batch: BatchEvidenceRecord,
    members: BatchEvidenceMemberRecord[]
  ): Promise<void>;
  updateBatch(batch: BatchEvidenceRecord): Promise<void>;
  clear(): Promise<void>;
}
