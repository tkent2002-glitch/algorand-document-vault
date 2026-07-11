import type { EvidenceRecord } from "../../services";
import {
  EvidenceStoreMigrationService,
  IndexedDbEvidenceStore,
  LocalStorageEvidenceStore,
} from "../../storage";
import type {
  EvidenceStore,
  EvidenceStoreMigrationResult,
} from "../../storage";

const MIGRATION_MARKER_KEY =
  "algorand-document-vault:evidence-storage-migrated-v1";

type EvidenceRepositoryListener = (records: EvidenceRecord[]) => void;

export class EvidenceRepository {
  private static listeners: EvidenceRepositoryListener[] = [];

  private static store: EvidenceStore =
    new LocalStorageEvidenceStore();

  private static initializationPromise:
    Promise<EvidenceStoreMigrationResult> | null = null;

  static initializeDurableStorage(): Promise<EvidenceStoreMigrationResult> {
    if (!EvidenceRepository.initializationPromise) {
      EvidenceRepository.initializationPromise =
        EvidenceRepository.initializeIndexedDbStorage();
    }

    return EvidenceRepository.initializationPromise;
  }

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

  private static async initializeIndexedDbStorage():
    Promise<EvidenceStoreMigrationResult> {
    const localStorageStore = new LocalStorageEvidenceStore();
    const indexedDbStore = new IndexedDbEvidenceStore();

    const migrationCompleted =
      localStorage.getItem(MIGRATION_MARKER_KEY) === "complete";

    if (migrationCompleted) {
      const indexedDbRecords = await indexedDbStore.list();
      const localStorageRecords = await localStorageStore.list();

      const indexedDbUnexpectedlyEmpty =
        indexedDbRecords.length === 0 &&
        localStorageRecords.length > 0;

      if (!indexedDbUnexpectedlyEmpty) {
        EvidenceRepository.store = indexedDbStore;

        return {
          sourceRecords: localStorageRecords.length,
          existingTargetRecords: indexedDbRecords.length,
          migratedRecords: 0,
          skippedExistingRecords: 0,
          blockedConflictingRecords: 0,
          finalTargetRecords: indexedDbRecords.length,
        };
      }

      console.warn(
        "IndexedDB was empty after a completed migration. Recovery migration will run."
      );
    }

    const migration =
      await EvidenceStoreMigrationService.migrate(
        localStorageStore,
        indexedDbStore
      );

    if (migration.blockedConflictingRecords > 0) {
      throw new Error(
        `IndexedDB activation blocked because ${migration.blockedConflictingRecords} conflicting evidence record(s) were detected.`
      );
    }

    EvidenceRepository.store = indexedDbStore;
    localStorage.setItem(MIGRATION_MARKER_KEY, "complete");

    return migration;
  }

  private static async notifyAsync(): Promise<void> {
    const records = await EvidenceRepository.listAsync();

    for (const listener of EvidenceRepository.listeners) {
      listener(records);
    }
  }
}
