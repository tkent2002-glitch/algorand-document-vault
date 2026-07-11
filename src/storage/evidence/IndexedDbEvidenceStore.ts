import type { EvidenceRecord } from "../../services";
import type { EvidenceStore } from "./EvidenceStore";

const DATABASE_NAME = "algorand-document-vault";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "evidence-records";
const HASH_INDEX_NAME = "hash-value";

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
      reject(
        transaction.error ?? new Error("IndexedDB transaction was aborted.")
      );
    });

    transaction.addEventListener("error", () => {
      reject(
        transaction.error ?? new Error("IndexedDB transaction failed.")
      );
    });
  });
}

export class IndexedDbEvidenceStore implements EvidenceStore {
  private databasePromise: Promise<IDBDatabase> | null = null;

  async list(): Promise<EvidenceRecord[]> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readonly"
    );
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    const records = await requestToPromise(
      objectStore.getAll() as IDBRequest<EvidenceRecord[]>
    );

    await transactionToPromise(transaction);

    return records.sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    );
  }

  async findByHash(hashValue: string): Promise<EvidenceRecord | null> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readonly"
    );
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
    const hashIndex = objectStore.index(HASH_INDEX_NAME);

    const record = await requestToPromise(
      hashIndex.get(hashValue) as IDBRequest<EvidenceRecord | undefined>
    );

    await transactionToPromise(transaction);

    return record ?? null;
  }

  async save(record: EvidenceRecord): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readwrite"
    );
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    objectStore.put(record);

    await transactionToPromise(transaction);
  }

  async saveAll(records: EvidenceRecord[]): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readwrite"
    );
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    objectStore.clear();

    for (const record of records) {
      objectStore.put(record);
    }

    await transactionToPromise(transaction);
  }

  async clear(): Promise<void> {
    const database = await this.openDatabase();
    const transaction = database.transaction(
      OBJECT_STORE_NAME,
      "readwrite"
    );
    const objectStore = transaction.objectStore(OBJECT_STORE_NAME);

    objectStore.clear();

    await transactionToPromise(transaction);
  }

  private openDatabase(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(
          DATABASE_NAME,
          DATABASE_VERSION
        );

        request.addEventListener("upgradeneeded", () => {
          const database = request.result;

          const objectStore = database.objectStoreNames.contains(
            OBJECT_STORE_NAME
          )
            ? request.transaction?.objectStore(OBJECT_STORE_NAME)
            : database.createObjectStore(OBJECT_STORE_NAME, {
                keyPath: "id",
              });

          if (
            objectStore &&
            !objectStore.indexNames.contains(HASH_INDEX_NAME)
          ) {
            objectStore.createIndex(
              HASH_INDEX_NAME,
              "hashValue",
              { unique: false }
            );
          }
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
          reject(
            new Error(
              "IndexedDB upgrade is blocked by another open application tab."
            )
          );
        });

        request.addEventListener("error", () => {
          reject(
            request.error ?? new Error("Unable to open IndexedDB.")
          );
        });
      });
    }

    return this.databasePromise;
  }
}
