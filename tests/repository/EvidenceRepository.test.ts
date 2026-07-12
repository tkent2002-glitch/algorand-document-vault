import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceRepository } from "../../src/repositories";
import type { EvidenceRecord } from "../../src/services";

function installLocalStorageMock() {
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
}

function createRecord(id: string, hashValue: string): EvidenceRecord {
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
        createdAt: "2026-07-08T00:00:00.000Z",
      },
      createdAt: "2026-07-08T00:00:00.000Z",
    },
    createdAt: "2026-07-08T00:00:00.000Z",
  };
}

const hashA =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

const hashB =
  "486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7";

describe("EvidenceRepository async API", () => {
  beforeEach(async () => {
    installLocalStorageMock();
    await EvidenceRepository.clearAsync();
  });

  it("saves and lists evidence records", async () => {
    const record = createRecord("record-1", hashA);

    await EvidenceRepository.saveAsync(record);

    expect(await EvidenceRepository.listAsync()).toEqual([record]);
  });

  it("finds a record by hash", async () => {
    const recordA = createRecord("record-1", hashA);
    const recordB = createRecord("record-2", hashB);

    await EvidenceRepository.saveAsync(recordA);
    await EvidenceRepository.saveAsync(recordB);

    expect(await EvidenceRepository.findByHashAsync(hashB)).toEqual(recordB);
  });

  it("returns null when a hash does not exist", async () => {
    expect(await EvidenceRepository.findByHashAsync(hashA)).toBeNull();
  });

  it("replaces repository contents with saveAllAsync", async () => {
    const recordA = createRecord("record-1", hashA);
    const recordB = createRecord("record-2", hashB);

    await EvidenceRepository.saveAsync(recordA);
    await EvidenceRepository.saveAllAsync([recordB]);

    expect(await EvidenceRepository.listAsync()).toEqual([recordB]);
  });

  it("clears all records", async () => {
    await EvidenceRepository.saveAsync(
      createRecord("record-1", hashA)
    );

    await EvidenceRepository.clearAsync();

    expect(await EvidenceRepository.listAsync()).toEqual([]);
  });

  it("notifies subscribers when records change", async () => {
    const listener = vi.fn();
    const unsubscribe = EvidenceRepository.subscribe(listener);

    await EvidenceRepository.saveAsync(
      createRecord("record-1", hashA)
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      await EvidenceRepository.listAsync()
    );

    unsubscribe();
  });

  it("stops notifying unsubscribed listeners", async () => {
    const listener = vi.fn();
    const unsubscribe = EvidenceRepository.subscribe(listener);

    unsubscribe();

    await EvidenceRepository.saveAsync(
      createRecord("record-1", hashA)
    );

    expect(listener).not.toHaveBeenCalled();
  });
});
