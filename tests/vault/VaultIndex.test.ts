import { describe, expect, it } from "vitest";
import type { EvidenceRecord } from "../../src/services";
import {
  buildEvidenceIndex,
  filterAndSortEvidenceIndex,
  paginateEvidenceIndex,
} from "../../src/pages/VaultPage/VaultIndex";

function createRecord(index: number): EvidenceRecord {
  const hashValue = index.toString(16).padStart(64, "0");
  const createdAt = new Date(
    Date.UTC(2026, 0, 1, 0, 0, index)
  ).toISOString();

  return {
    id: `record-${index}`,
    status: index % 5 === 0 ? "confirmed" : "draft",
    documentName: `document-${index.toString().padStart(5, "0")}.pdf`,
    hashAlgorithm: "SHA-256",
    hashValue,
    proof: {
      id: `proof-${index}`,
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
    confirmedRound: index % 5 === 0 ? index : undefined,
    createdAt,
  };
}

describe("Vault document indexing", () => {
  it("bounds a 10,000-document Vault to 50 rendered index rows", () => {
    const records = Array.from({ length: 10_000 }, (_, index) =>
      createRecord(index)
    );

    const index = buildEvidenceIndex(records);
    const sorted = filterAndSortEvidenceIndex(index, "", "all", "newest");
    const firstPage = paginateEvidenceIndex(sorted, 1, 50);
    const finalPage = paginateEvidenceIndex(sorted, 200, 50);

    expect(index).toHaveLength(10_000);
    expect(firstPage.items).toHaveLength(50);
    expect(firstPage.totalItems).toBe(10_000);
    expect(firstPage.totalPages).toBe(200);
    expect(firstPage.items[0].documentName).toBe("document-09999.pdf");
    expect(finalPage.items).toHaveLength(50);
    expect(finalPage.items.at(-1)?.documentName).toBe("document-00000.pdf");
  });

  it("groups record history and applies search, status, and sort controls", () => {
    const older = createRecord(10);
    const newer = {
      ...createRecord(11),
      id: "newer-version",
      documentName: older.documentName,
      hashValue: older.hashValue,
      proof: {
        ...createRecord(11).proof,
        payload: {
          ...createRecord(11).proof.payload,
          hash: {
            algorithm: "SHA-256" as const,
            value: older.hashValue,
          },
        },
      },
    };

    const index = buildEvidenceIndex([older, newer, createRecord(12)]);
    const filtered = filterAndSortEvidenceIndex(
      index,
      "document-00010",
      "draft",
      "filename"
    );

    expect(index).toHaveLength(2);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].records.map((record) => record.id)).toEqual([
      "newer-version",
      "record-10",
    ]);
  });
});
