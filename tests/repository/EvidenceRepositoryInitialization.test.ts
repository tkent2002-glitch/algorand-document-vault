import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceRepository } from "../../src/repositories";
import type { EvidenceRecord } from "../../src/services";

const MIGRATION_MARKER_KEY =
  "algorand-document-vault:evidence-storage-migrated-v1";

const STORAGE_KEY =
  "algorand-document-vault:evidence-records";

const hashA =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

function createRecord(id: string): EvidenceRecord {
  const createdAt = "2026-07-11T00:00:00.000Z";

  return {
    id,
    status: "draft",
    documentName: `${id}.txt`,
    hashAlgorithm: "SHA-256",
    hashValue: hashA,
    proof: {
      id: `proof-${id}`,
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hashA,
        },
        createdAt,
      },
      createdAt,
    },
    createdAt,
  };
}

function installLocalStorageMock(): Map<string, string> {
  const store = new Map<string, string>();

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });

  return store;
}

describe("EvidenceRepository durable storage initialization", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  it("migrates localStorage records into IndexedDB on first initialization", async () => {
    const record = createRecord("record-1");

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([record])
    );

    const result =
      await EvidenceRepository.initializeDurableStorage();

    expect(result.migratedRecords).toBe(1);
    expect(result.blockedConflictingRecords).toBe(0);
    expect(await EvidenceRepository.listAsync()).toEqual([record]);
    expect(localStorage.getItem(MIGRATION_MARKER_KEY)).toBe(
      "complete"
    );
  });

  it("keeps localStorage records as a rollback source", async () => {
    const record = createRecord("record-1");

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([record])
    );

    await EvidenceRepository.initializeDurableStorage();

    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify([record])
    );
  });

  it("reuses the same initialization promise", async () => {
    const first =
      EvidenceRepository.initializeDurableStorage();

    const second =
      EvidenceRepository.initializeDurableStorage();

    expect(first).toBe(second);

    await first;
  });
});
