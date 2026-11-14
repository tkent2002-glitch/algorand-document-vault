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

    const { rerender } = render(
      <EvidenceCard record={record} onViewDetails={onViewDetails} />
    );

    expect(screen.queryByRole("button", { name: /verify/i })).toBeNull();

    const viewDetails = screen.getByRole("button", { name: "View Details" });
    expect(viewDetails.getAttribute("aria-expanded")).toBe("false");
    expect(viewDetails.getAttribute("aria-controls")).toBe(
      "evidence-details-evidence-record-1"
    );

    fireEvent.click(viewDetails);
    expect(onViewDetails).toHaveBeenCalledWith(record);

    rerender(
      <EvidenceCard
        record={record}
        detailsOpen
        onViewDetails={onViewDetails}
      />
    );

    const hideDetails = screen.getByRole("button", { name: "Hide Details" });
    expect(hideDetails.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(hideDetails);
    expect(onViewDetails).toHaveBeenCalledTimes(2);
  });
});
