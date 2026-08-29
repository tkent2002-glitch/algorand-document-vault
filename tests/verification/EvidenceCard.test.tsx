// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EvidenceCard from "../../src/components/cards/EvidenceCard";
import type { EvidenceRecord } from "../../src/services";

describe("EvidenceCard", () => {
  it("keeps View Details as the only matching-record action", () => {
    const record: EvidenceRecord = {
      id: "evidence-record-1",
      status: "confirmed",
      documentName: "verified-document.txt",
      hashAlgorithm: "SHA-256",
      hashValue: "a".repeat(64),
      proof: {
        id: "proof-1",
        status: "created",
        payload: {
          schemaVersion: "1.0",
          hash: {
            algorithm: "SHA-256",
            value: "a".repeat(64),
          },
          createdAt: "2026-08-28T12:00:00.000Z",
        },
        createdAt: "2026-08-28T12:00:00.000Z",
      },
      createdAt: "2026-08-28T12:00:00.000Z",
    };
    const onViewDetails = vi.fn();

    render(
      <EvidenceCard record={record} onViewDetails={onViewDetails} />
    );

    expect(screen.queryByRole("button", { name: /verify/i })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "View Details" }));
    expect(onViewDetails).toHaveBeenCalledWith(record);
  });
});
