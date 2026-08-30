// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotarizationSuccessPanel from "../../src/pages/NotarizePage/components/NotarizationSuccessPanel";
import type { EvidenceRecord } from "../../src/services";

vi.mock("../../src/services", () => ({
  AlgorandExplorerService: {
    getTransactionUrl: (transactionId: string) =>
      `https://testnet.explorer.perawallet.app/tx/${transactionId}`,
  },
}));

describe("NotarizationSuccessPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("presents a compact receipt with optional proof guidance collapsed", () => {
    const evidenceRecord = {
      id: "3e9d4e45-c010-41d1-8be6-9d4e1ed9cab7",
      status: "confirmed",
      documentName: "contract.pdf",
      hashValue:
        "31fe0157829c40498154546999ceef51c7b0cfcc296c7d659e7337452eb333d0",
    } as EvidenceRecord;

    render(
      <NotarizationSuccessPanel
        confirmationResult={{
          transactionId:
            "ANSRF22NQBN356VOTZPCN7XRC5FUG5KYFHWJHZMKEA4XUISKL42A",
          confirmedRound: 66769209,
          confirmedAt: "2026-08-29T01:27:05.987Z",
        }}
        evidenceRecord={evidenceRecord}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Notarization complete"
    );
    expect(screen.getByText("contract.pdf")).toBeVisible();
    expect(screen.getByText("66769209")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "View on Pera Explorer" })
    ).toHaveAttribute(
      "href",
      "https://testnet.explorer.perawallet.app/tx/ANSRF22NQBN356VOTZPCN7XRC5FUG5KYFHWJHZMKEA4XUISKL42A"
    );

    const boundarySummary = screen
      .getByText("What this confirmation proves")
      .closest("summary");

    expect(boundarySummary).not.toBeNull();
    expect(boundarySummary?.closest("details")).not.toHaveAttribute("open");
  });
});
