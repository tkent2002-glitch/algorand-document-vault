export const StorageConfiguration = {
  indexedDb: {
    databaseName: "algorand-document-vault",
    databaseVersion: 1,
    evidenceObjectStoreName: "evidence-records",
    evidenceHashIndexName: "hash-value",
  },

  migration: {
    evidenceStorageMarkerKey:
      "algorand-document-vault:evidence-storage-migrated-v1",
  },

  legacy: {
    evidenceStorageKey:
      "algorand-document-vault:evidence-records",
  },
} as const;
