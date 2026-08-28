import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const MIGRATION_MARKER_KEY =
  "algorand-document-vault:evidence-storage-migrated-v1";

const STORAGE_KEY =
  "algorand-document-vault:evidence-records";

function installLocalStorageMock(): void {
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

describe("EvidenceRepository corrupted legacy storage", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  it("fails closed and does not mark migration complete when legacy evidence is malformed", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      "{malformed-json"
    );

    const { EvidenceRepository } =
      await import("../../src/repositories");

    await expect(
      EvidenceRepository.initializeDurableStorage()
    ).rejects.toThrow(
      "Stored evidence records are unreadable."
    );

    expect(
      localStorage.getItem(MIGRATION_MARKER_KEY)
    ).toBeNull();
  });
});
