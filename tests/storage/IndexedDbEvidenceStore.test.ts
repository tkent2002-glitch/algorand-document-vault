import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { IndexedDbEvidenceStore } from "../../src/storage/evidence/IndexedDbEvidenceStore";
import type { EvidenceRecord } from "../../src/services/notarization/EvidenceRecordService";

const hashA =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

const hashB =
  "486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7";

function createRecord(
  id: string,
  hashValue: string,
  createdAt: string
): EvidenceRecord {
  return {
    id,
    status: "draft",
    documentName: `${id}.txt`,
    hashAlgorithm: "SHA-256",
    hashValue,
    proof: {
      id: `proof-${id}`,
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hashValue,
        },
        createdAt,
      },
      createdAt,
    },
    createdAt,
  };
}

describe("IndexedDbEvidenceStore", () => {
  const store = new IndexedDbEvidenceStore();

  beforeEach(async () => {
    await store.clear();
  });

  it("saves and lists evidence records", async () => {
    const record = createRecord(
      "record-1",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    await store.save(record);

    expect(await store.list()).toEqual([record]);
  });

  it("returns records newest first", async () => {
    const older = createRecord(
      "record-older",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    const newer = createRecord(
      "record-newer",
      hashB,
      "2026-07-11T00:00:00.000Z"
    );

    await store.save(older);
    await store.save(newer);

    const records = await store.list();

    expect(records.map((record) => record.id)).toEqual([
      "record-newer",
      "record-older",
    ]);
  });

  it("finds an evidence record by document hash", async () => {
    const recordA = createRecord(
      "record-1",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    const recordB = createRecord(
      "record-2",
      hashB,
      "2026-07-10T01:00:00.000Z"
    );

    await store.save(recordA);
    await store.save(recordB);

    expect(await store.findByHash(hashB)).toEqual(recordB);
  });

  it("returns null when a document hash does not exist", async () => {
    expect(await store.findByHash(hashA)).toBeNull();
  });

  it("updates an existing record with the same id", async () => {
    const original = createRecord(
      "record-1",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    const updated: EvidenceRecord = {
      ...original,
      status: "confirmed",
      algorandTransactionId: "TEST-TRANSACTION-ID",
      confirmedRound: 123456,
      confirmedAt: "2026-07-10T01:00:00.000Z",
    };

    await store.save(original);
    await store.save(updated);

    expect(await store.list()).toEqual([updated]);
  });

  it("replaces all records with saveAll", async () => {
    const original = createRecord(
      "record-original",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    const replacement = createRecord(
      "record-replacement",
      hashB,
      "2026-07-11T00:00:00.000Z"
    );

    await store.save(original);
    await store.saveAll([replacement]);

    expect(await store.list()).toEqual([replacement]);
  });

  it("clears all evidence records", async () => {
    const record = createRecord(
      "record-1",
      hashA,
      "2026-07-10T00:00:00.000Z"
    );

    await store.save(record);
    await store.clear();

    expect(await store.list()).toEqual([]);
  });
});
