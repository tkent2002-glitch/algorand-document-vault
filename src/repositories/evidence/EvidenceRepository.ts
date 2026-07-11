import type { EvidenceRecord } from "../../services";
import { EvidenceRecordStoreService } from "../../services/notarization/EvidenceRecordStoreService";
import { LocalStorageEvidenceStore } from "../../storage";
import type { EvidenceStore } from "../../storage";

type EvidenceRepositoryListener = (records: EvidenceRecord[]) => void;

export class EvidenceRepository {
  private static listeners: EvidenceRepositoryListener[] = [];

  private static store: EvidenceStore =
    new LocalStorageEvidenceStore();

  /*
   * Temporary synchronous compatibility API.
   *
   * These methods remain only while existing callers are migrated.
   * They must be removed before switching the repository backend to IndexedDB.
   */

  static list(): EvidenceRecord[] {
    return EvidenceRecordStoreService.list();
  }

  static findByHash(hashValue: string): EvidenceRecord | null {
    return EvidenceRecordStoreService.findByHash(hashValue);
  }

  static save(record: EvidenceRecord): void {
    EvidenceRecordStoreService.save(record);
    EvidenceRepository.notifySync();
  }

  static saveAll(records: EvidenceRecord[]): void {
    EvidenceRecordStoreService.saveAll(records);
    EvidenceRepository.notifySync();
  }

  static clear(): void {
    EvidenceRecordStoreService.clear();
    EvidenceRepository.notifySync();
  }

  /*
   * Durable-storage-compatible asynchronous API.
   */

  static async listAsync(): Promise<EvidenceRecord[]> {
    return EvidenceRepository.store.list();
  }

  static async findByHashAsync(
    hashValue: string
  ): Promise<EvidenceRecord | null> {
    return EvidenceRepository.store.findByHash(hashValue);
  }

  static async saveAsync(record: EvidenceRecord): Promise<void> {
    await EvidenceRepository.store.save(record);
    await EvidenceRepository.notifyAsync();
  }

  static async saveAllAsync(
    records: EvidenceRecord[]
  ): Promise<void> {
    await EvidenceRepository.store.saveAll(records);
    await EvidenceRepository.notifyAsync();
  }

  static async clearAsync(): Promise<void> {
    await EvidenceRepository.store.clear();
    await EvidenceRepository.notifyAsync();
  }

  static subscribe(listener: EvidenceRepositoryListener): () => void {
    EvidenceRepository.listeners.push(listener);

    return () => {
      EvidenceRepository.listeners =
        EvidenceRepository.listeners.filter(
          (currentListener) => currentListener !== listener
        );
    };
  }

  private static notifySync(): void {
    const records = EvidenceRepository.list();

    for (const listener of EvidenceRepository.listeners) {
      listener(records);
    }
  }

  private static async notifyAsync(): Promise<void> {
    const records = await EvidenceRepository.listAsync();

    for (const listener of EvidenceRepository.listeners) {
      listener(records);
    }
  }
}
