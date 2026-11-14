import { describe, expect, it } from "vitest";
import { applyEvidenceRepositoryEvent } from "../../src/hooks/useEvidenceRecords";
import type { EvidenceRecord } from "../../src/services";

function createRecord(id: string, status: EvidenceRecord["status"] = "draft"):
  EvidenceRecord {
  const hashValue = id.padStart(64, "0");

  return {
    id,
    status,
    documentName: `${id}.txt`,
    hashAlgorithm: "SHA-256",
    hashValue,
    proof: {
      id: `proof-${id}`,
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: { algorithm: "SHA-256", value: hashValue },
        createdAt: "2026-09-13T00:00:00.000Z",
      },
      createdAt: "2026-09-13T00:00:00.000Z",
    },
    createdAt: "2026-09-13T00:00:00.000Z",
  };
}

describe("evidence repository delta application", () => {
  it("appends new records and replaces records with matching IDs", () => {
    const first = createRecord("1");
    const second = createRecord("2");
    const confirmed = createRecord("1", "confirmed");

    const appended = applyEvidenceRepositoryEvent([first], {
      type: "upsert",
      record: second,
    });
    const updated = applyEvidenceRepositoryEvent(appended, {
      type: "upsert",
      record: confirmed,
    });

    expect(updated).toEqual([confirmed, second]);
  });

  it("applies full replacements and clears", () => {
    const replacement = [createRecord("2")];
    const replaced = applyEvidenceRepositoryEvent([createRecord("1")], {
      type: "replace",
      records: replacement,
    });

    expect(replaced).toEqual(replacement);
    expect(replaced).not.toBe(replacement);
    expect(
      applyEvidenceRepositoryEvent(replaced, { type: "clear" })
    ).toEqual([]);
  });
});
