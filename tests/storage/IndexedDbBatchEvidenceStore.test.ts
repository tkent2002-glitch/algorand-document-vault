import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { BatchEvidenceRecordService } from "../../src/services/notarization/BatchEvidenceRecordService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";
import { MerkleTreeService } from "../../src/services/merkle";
import { IndexedDbBatchEvidenceStore } from "../../src/storage/evidence/IndexedDbBatchEvidenceStore";

const HASH_A =
  "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";
const HASH_B =
  "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d";

async function createDraft() {
  const documents = [
    {
      sourceIndex: 0,
      documentName: "a.txt",
      size: 1,
      lastModified: 1,
      hashAlgorithm: "SHA-256" as const,
      hashValue: HASH_A,
    },
    {
      sourceIndex: 1,
      documentName: "b.txt",
      size: 1,
      lastModified: 1,
      hashAlgorithm: "SHA-256" as const,
      hashValue: HASH_B,
    },
  ];
  const merkleBatch = await MerkleTreeService.build(
    documents.map((document) => document.hashValue)
  );
  const proof = NotarizationService.createMerkleBatchProof(
    merkleBatch.root,
    merkleBatch.leafCount
  );

  return BatchEvidenceRecordService.createDraft(
    merkleBatch,
    documents,
    proof
  );
}

describe("IndexedDbBatchEvidenceStore", () => {
  const store = new IndexedDbBatchEvidenceStore();

  beforeEach(async () => {
    await store.clear();
  });

  it("atomically saves a batch and its members", async () => {
    const draft = await createDraft();
    await store.saveBatch(draft.batch, draft.members);

    expect(await store.listBatches()).toEqual([draft.batch]);
    expect(await store.listMembers(draft.batch.id)).toEqual(
      [...draft.members].sort((first, second) => first.leafIndex - second.leafIndex)
    );
  });

  it("indexes members by document fingerprint", async () => {
    const draft = await createDraft();
    await store.saveBatch(draft.batch, draft.members);

    const matches = await store.findMembersByHash(HASH_B);
    expect(matches).toHaveLength(1);
    expect(matches[0].documentName).toBe("b.txt");
  });

  it("updates confirmation data without replacing members", async () => {
    const draft = await createDraft();
    await store.saveBatch(draft.batch, draft.members);
    const confirmed = {
      ...draft.batch,
      status: "confirmed" as const,
      algorandTransactionId: "TEST-TRANSACTION",
      confirmedRound: 123,
      confirmedAt: "2026-09-12T00:00:00.000Z",
    };

    await store.updateBatch(confirmed);

    expect(await store.listBatches()).toEqual([confirmed]);
    expect(await store.listMembers(draft.batch.id)).toHaveLength(2);
  });

  it("rejects incomplete or cross-batch writes", async () => {
    const draft = await createDraft();
    await expect(
      store.saveBatch(draft.batch, draft.members.slice(1))
    ).rejects.toThrow("count");
    await expect(
      store.saveBatch(draft.batch, [
        { ...draft.members[0], batchId: "another-batch" },
        draft.members[1],
      ])
    ).rejects.toThrow("reference");
  });
});
