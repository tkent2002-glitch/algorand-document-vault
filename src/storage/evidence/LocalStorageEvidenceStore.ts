import type { EvidenceRecord } from "../../services";
import { EvidenceRecordStoreService } from "../../services/notarization/EvidenceRecordStoreService";
import type { EvidenceStore } from "./EvidenceStore";

export class LocalStorageEvidenceStore implements EvidenceStore {
  async list(): Promise<EvidenceRecord[]> {
    return EvidenceRecordStoreService.list();
  }

  async findByHash(hashValue: string): Promise<EvidenceRecord | null> {
    return EvidenceRecordStoreService.findByHash(hashValue);
  }

  async save(record: EvidenceRecord): Promise<void> {
    EvidenceRecordStoreService.save(record);
  }

  async saveAll(records: EvidenceRecord[]): Promise<void> {
    EvidenceRecordStoreService.saveAll(records);
  }

  async clear(): Promise<void> {
    EvidenceRecordStoreService.clear();
  }
}
