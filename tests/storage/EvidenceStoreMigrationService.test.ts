import { describe, expect, it } from "vitest";
import {
  EvidenceStoreMigrationService,
  type EvidenceStore,
} from "../../src/storage";
import type { EvidenceRecord } from "../../src/services";

const hashA =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

const hashB =
  "486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7";

function createRecord(
  id: string,
  hashValue: string
): EvidenceRecord {
  const createdAt = "2026-07-11T00:00:00.000Z";

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

class MemoryEvidenceStore implements EvidenceStore {
  private records: EvidenceRecord[];

  constructor(records: EvidenceRecord[] = []) {
    this.records = [...records];
  }

  async list(): Promise<EvidenceRecord[]> {
    return [...this.records];
  }

  async findByHash(
    hashValue: string
  ): Promise<EvidenceRecord | null> {
    return (
      this.records.find(
        (record) => record.hashValue === hashValue
      ) ?? null
    );
  }

  async save(record: EvidenceRecord): Promise<void> {
    const index = this.records.findIndex(
      (existing) => existing.id === record.id
    );

    if (index >= 0) {
      this.records[index] = record;
    } else {
      this.records.push(record);
    }
  }

  async saveAll(records: EvidenceRecord[]): Promise<void> {
    this.records = [...records];
  }

  async clear(): Promise<void> {
    this.records = [];
  }
}

describe("EvidenceStoreMigrationService", () => {
  it("migrates records into an empty target store", async () => {
    const record = createRecord("record-1", hashA);
    const source = new MemoryEvidenceStore([record]);
    const target = new MemoryEvidenceStore();

    const result = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    expect(result.migratedRecords).toBe(1);
    expect(result.skippedExistingRecords).toBe(0);
    expect(result.blockedConflictingRecords).toBe(0);
    expect(await target.list()).toEqual([record]);
  });

  it("preserves records already in the target", async () => {
    const sourceRecord = createRecord("record-1", hashA);
    const targetRecord = createRecord("record-2", hashB);

    const source = new MemoryEvidenceStore([sourceRecord]);
    const target = new MemoryEvidenceStore([targetRecord]);

    const result = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    expect(result.migratedRecords).toBe(1);
    expect(await target.list()).toEqual([
      targetRecord,
      sourceRecord,
    ]);
  });

  it("skips an identical existing record", async () => {
    const record = createRecord("record-1", hashA);

    const source = new MemoryEvidenceStore([record]);
    const target = new MemoryEvidenceStore([record]);

    const result = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    expect(result.migratedRecords).toBe(0);
    expect(result.skippedExistingRecords).toBe(1);
    expect(result.blockedConflictingRecords).toBe(0);
    expect(await target.list()).toEqual([record]);
  });

  it("blocks the same record id with a different fingerprint", async () => {
    const sourceRecord = createRecord("record-1", hashA);
    const targetRecord = createRecord("record-1", hashB);

    const source = new MemoryEvidenceStore([sourceRecord]);
    const target = new MemoryEvidenceStore([targetRecord]);

    const result = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    expect(result.migratedRecords).toBe(0);
    expect(result.skippedExistingRecords).toBe(0);
    expect(result.blockedConflictingRecords).toBe(1);
    expect(await target.list()).toEqual([targetRecord]);
  });

  it("is safe to run repeatedly", async () => {
    const record = createRecord("record-1", hashA);

    const source = new MemoryEvidenceStore([record]);
    const target = new MemoryEvidenceStore();

    const first = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    const second = await EvidenceStoreMigrationService.migrate(
      source,
      target
    );

    expect(first.migratedRecords).toBe(1);
    expect(second.migratedRecords).toBe(0);
    expect(second.skippedExistingRecords).toBe(1);
    expect(await target.list()).toEqual([record]);
  });
});
