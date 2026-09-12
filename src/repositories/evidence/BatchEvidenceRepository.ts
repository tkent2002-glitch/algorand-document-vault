import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../../services/notarization/BatchEvidenceRecordService";
import { IndexedDbBatchEvidenceStore } from "../../storage/evidence/IndexedDbBatchEvidenceStore";

export class BatchEvidenceRepository {
  private static readonly store = new IndexedDbBatchEvidenceStore();

  static listBatchesAsync(): Promise<BatchEvidenceRecord[]> {
    return this.store.listBatches();
  }

  static listMembersAsync(batchId: string): Promise<BatchEvidenceMemberRecord[]> {
    return this.store.listMembers(batchId);
  }

  static findMembersByHashAsync(
    hashValue: string
  ): Promise<BatchEvidenceMemberRecord[]> {
    return this.store.findMembersByHash(hashValue);
  }

  static saveBatchAsync(
    batch: BatchEvidenceRecord,
    members: BatchEvidenceMemberRecord[]
  ): Promise<void> {
    return this.store.saveBatch(batch, members);
  }

  static updateBatchAsync(batch: BatchEvidenceRecord): Promise<void> {
    return this.store.updateBatch(batch);
  }

  static clearAsync(): Promise<void> {
    return this.store.clear();
  }
}
