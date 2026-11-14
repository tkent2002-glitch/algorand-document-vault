import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../../services/notarization/BatchEvidenceRecordService";
import { StorageConfiguration } from "../StorageConfiguration";
import type { BatchEvidenceStore } from "./BatchEvidenceStore";
import { upgradeEvidenceDatabase } from "./IndexedDbSchema";

const CONFIGURATION = StorageConfiguration.indexedDb;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    });
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    });
  });
}

export class IndexedDbBatchEvidenceStore implements BatchEvidenceStore {
  private databasePromise: Promise<IDBDatabase> | null = null;

  async listBatches(): Promise<BatchEvidenceRecord[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      CONFIGURATION.batchObjectStoreName,
      "readonly"
    );
    const records = await requestToPromise(
      transaction.objectStore(CONFIGURATION.batchObjectStoreName).getAll() as
        IDBRequest<BatchEvidenceRecord[]>
    );
    await transactionToPromise(transaction);

    return records.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  }

  async listMembers(batchId: string): Promise<BatchEvidenceMemberRecord[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      CONFIGURATION.batchMemberObjectStoreName,
      "readonly"
    );
    const index = transaction
      .objectStore(CONFIGURATION.batchMemberObjectStoreName)
      .index(CONFIGURATION.batchMemberBatchIndexName);
    const members = await requestToPromise(
      index.getAll(batchId) as IDBRequest<BatchEvidenceMemberRecord[]>
    );
    await transactionToPromise(transaction);

    return members.sort((first, second) => first.leafIndex - second.leafIndex);
  }

  async findMembersByHash(
    hashValue: string
  ): Promise<BatchEvidenceMemberRecord[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      CONFIGURATION.batchMemberObjectStoreName,
      "readonly"
    );
    const index = transaction
      .objectStore(CONFIGURATION.batchMemberObjectStoreName)
      .index(CONFIGURATION.batchMemberHashIndexName);
    const members = await requestToPromise(
      index.getAll(hashValue) as IDBRequest<BatchEvidenceMemberRecord[]>
    );
    await transactionToPromise(transaction);
    return members;
  }

  async saveBatch(
    batch: BatchEvidenceRecord,
    members: BatchEvidenceMemberRecord[]
  ): Promise<void> {
    if (members.length !== batch.leafCount) {
      throw new Error("Batch member count does not match the batch leaf count.");
    }

    if (members.some((member) => member.batchId !== batch.id)) {
      throw new Error("Every batch member must reference the saved batch.");
    }

    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        CONFIGURATION.batchObjectStoreName,
        CONFIGURATION.batchMemberObjectStoreName,
      ],
      "readwrite"
    );

    transaction.objectStore(CONFIGURATION.batchObjectStoreName).put(batch);
    const memberStore = transaction.objectStore(
      CONFIGURATION.batchMemberObjectStoreName
    );

    for (const member of members) {
      memberStore.put(member);
    }

    await transactionToPromise(transaction);
  }

  async updateBatch(batch: BatchEvidenceRecord): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      CONFIGURATION.batchObjectStoreName,
      "readwrite"
    );
    transaction.objectStore(CONFIGURATION.batchObjectStoreName).put(batch);
    await transactionToPromise(transaction);
  }

  async clear(): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      [
        CONFIGURATION.batchObjectStoreName,
        CONFIGURATION.batchMemberObjectStoreName,
      ],
      "readwrite"
    );
    transaction.objectStore(CONFIGURATION.batchObjectStoreName).clear();
    transaction.objectStore(CONFIGURATION.batchMemberObjectStoreName).clear();
    await transactionToPromise(transaction);
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(
          CONFIGURATION.databaseName,
          CONFIGURATION.databaseVersion
        );

        request.addEventListener("upgradeneeded", () => {
          upgradeEvidenceDatabase(request.result, request.transaction);
        });
        request.addEventListener("success", () => {
          const database = request.result;
          database.addEventListener("versionchange", () => {
            database.close();
            this.databasePromise = null;
          });
          resolve(database);
        });
        request.addEventListener("blocked", () => {
          reject(new Error("IndexedDB upgrade is blocked by another open tab."));
        });
        request.addEventListener("error", () => {
          reject(request.error ?? new Error("Unable to open IndexedDB."));
        });
      });
    }

    return this.databasePromise;
  }
}
