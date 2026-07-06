import type { EvidenceRecord } from "./EvidenceRecordService";

const STORAGE_KEY = "algorand-document-vault:evidence-records";

export class EvidenceRecordStoreService {
  static list(): EvidenceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as EvidenceRecord[];
  }

  static findByHash(hashValue: string): EvidenceRecord | null {
    const records = this.list();

    return records.find((record) => record.hashValue === hashValue) ?? null;
  }

  static save(record: EvidenceRecord): void {
    const records = this.list();
    const existingIndex = records.findIndex((item) => item.id === record.id);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}
