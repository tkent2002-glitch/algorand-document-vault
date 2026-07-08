import type { EvidenceRecord } from "../../services";
import { EvidenceRecordStoreService } from "../../services";

type EvidenceRepositoryListener = (records: EvidenceRecord[]) => void;

export class EvidenceRepository {
  private static listeners: EvidenceRepositoryListener[] = [];

  static list(): EvidenceRecord[] {
    return EvidenceRecordStoreService.list();
  }

  static findByHash(hashValue: string): EvidenceRecord | null {
    return EvidenceRecordStoreService.findByHash(hashValue);
  }

  static save(record: EvidenceRecord): void {
    EvidenceRecordStoreService.save(record);
    EvidenceRepository.notify();
  }

  static saveAll(records: EvidenceRecord[]): void {
    EvidenceRecordStoreService.saveAll(records);
    EvidenceRepository.notify();
  }

  static clear(): void {
    EvidenceRecordStoreService.clear();
    EvidenceRepository.notify();
  }

  static subscribe(listener: EvidenceRepositoryListener): () => void {
    EvidenceRepository.listeners.push(listener);

    return () => {
      EvidenceRepository.listeners = EvidenceRepository.listeners.filter(
        (currentListener) => currentListener !== listener
      );
    };
  }

  private static notify(): void {
    const records = EvidenceRepository.list();

    for (const listener of EvidenceRepository.listeners) {
      listener(records);
    }
  }
}
