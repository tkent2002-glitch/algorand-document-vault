import type { EvidenceRecord } from "../../services";

export interface EvidenceStore {
  list(): Promise<EvidenceRecord[]>;
  findByHash(hashValue: string): Promise<EvidenceRecord | null>;
  save(record: EvidenceRecord): Promise<void>;
  saveAll(records: EvidenceRecord[]): Promise<void>;
  clear(): Promise<void>;
}
