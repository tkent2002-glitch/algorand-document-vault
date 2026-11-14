export const StorageConfiguration = {
  indexedDb: {
    databaseName: "algorand-document-vault",
    databaseVersion: 2,
    evidenceObjectStoreName: "evidence-records",
    evidenceHashIndexName: "hash-value",
    batchObjectStoreName: "evidence-batches",
    batchMemberObjectStoreName: "evidence-batch-members",
    batchMemberBatchIndexName: "batch-id",
    batchMemberHashIndexName: "batch-member-hash-value",
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
