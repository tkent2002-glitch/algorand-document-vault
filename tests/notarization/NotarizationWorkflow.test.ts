import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotarizationWorkflow } from "../../src/core/NotarizationWorkflow";
import { EvidenceRepository } from "../../src/repositories";

function installLocalStorageMock() {
  const store = new Map<string, string>();

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
}

describe("NotarizationWorkflow", () => {
  beforeEach(async () => {
    installLocalStorageMock();
    await EvidenceRepository.clearAsync();
  });

  it("rejects a missing file", async () => {
    const result = await NotarizationWorkflow.execute(null);

    expect(result.proof).toBeNull();
    expect(result.evidenceRecord).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("creates a proof, evidence record, and serialized payload", async () => {
    const file = new File(["hello"], "hello.txt", {
      type: "text/plain",
    });

    const result = await NotarizationWorkflow.execute(file);

    expect(result.fileName).toBe("hello.txt");
    expect(result.hashValue).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
    expect(result.proof).not.toBeNull();
    expect(result.evidenceRecord).not.toBeNull();
    expect(result.serializedProofPayload).toContain(result.hashValue);
    expect(result.errors).toEqual([]);
  });

  it("detects an existing document fingerprint", async () => {
    const firstFile = new File(["hello"], "hello.txt", {
      type: "text/plain",
    });

    const secondFile = new File(["hello"], "hello-copy.txt", {
      type: "text/plain",
    });

    await NotarizationWorkflow.execute(firstFile);
    const duplicateResult = await NotarizationWorkflow.execute(secondFile);

    expect(duplicateResult.duplicateRecord).not.toBeNull();
    expect(duplicateResult.duplicateRecord?.hashValue).toBe(
      duplicateResult.hashValue
    );
  });
});
