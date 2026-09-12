import { StorageConfiguration } from "../StorageConfiguration";

export function upgradeEvidenceDatabase(
  database: IDBDatabase,
  transaction: IDBTransaction | null
): void {
  const configuration = StorageConfiguration.indexedDb;

  const evidenceStore = database.objectStoreNames.contains(
    configuration.evidenceObjectStoreName
  )
    ? transaction?.objectStore(configuration.evidenceObjectStoreName)
    : database.createObjectStore(configuration.evidenceObjectStoreName, {
        keyPath: "id",
      });

  if (
    evidenceStore &&
    !evidenceStore.indexNames.contains(configuration.evidenceHashIndexName)
  ) {
    evidenceStore.createIndex(
      configuration.evidenceHashIndexName,
      "hashValue",
      { unique: false }
    );
  }

  if (!database.objectStoreNames.contains(configuration.batchObjectStoreName)) {
    database.createObjectStore(configuration.batchObjectStoreName, {
      keyPath: "id",
    });
  }

  const memberStore = database.objectStoreNames.contains(
    configuration.batchMemberObjectStoreName
  )
    ? transaction?.objectStore(configuration.batchMemberObjectStoreName)
    : database.createObjectStore(configuration.batchMemberObjectStoreName, {
        keyPath: "id",
      });

  if (
    memberStore &&
    !memberStore.indexNames.contains(configuration.batchMemberBatchIndexName)
  ) {
    memberStore.createIndex(
      configuration.batchMemberBatchIndexName,
      "batchId",
      { unique: false }
    );
  }

  if (
    memberStore &&
    !memberStore.indexNames.contains(configuration.batchMemberHashIndexName)
  ) {
    memberStore.createIndex(
      configuration.batchMemberHashIndexName,
      "hashValue",
      { unique: false }
    );
  }
}
