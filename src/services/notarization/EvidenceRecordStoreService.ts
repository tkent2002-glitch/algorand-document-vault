import { StorageConfiguration } from "../../storage/StorageConfiguration";
import type { EvidenceRecord } from "./EvidenceRecordService";

const STORAGE_KEY =
  StorageConfiguration.legacy.evidenceStorageKey;

export class EvidenceRecordStoreService {
  static list(): EvidenceRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as EvidenceRecord[];
    } catch (error) {
      console.error("Failed to read evidence records from local storage:", error);
      return [];
    }
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

    this.saveAll(records);
  }

  static saveAll(records: EvidenceRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
