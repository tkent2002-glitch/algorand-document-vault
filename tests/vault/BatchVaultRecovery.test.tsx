// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BatchEvidenceRepository } from "../../src/repositories/evidence/BatchEvidenceRepository";
import BatchVaultSection from "../../src/pages/VaultPage/BatchVaultSection";
import { AlgorandBatchRecoveryService } from "../../src/services/algorand/AlgorandBatchRecoveryService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";
import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../../src/services/notarization";

vi.mock("@perawallet/connect", () => ({
  PeraWalletConnect: class {},
}));

const root = "a".repeat(64);
const submittedBatch: BatchEvidenceRecord = {
  id: "submitted-batch",
  status: "submitted",
  merkleRoot: root,
  treeAlgorithm: "adv-merkle-sha256-v1",
  leafCount: 1,
  proof: NotarizationService.createMerkleBatchProof(root, 1),
  algorandTransactionId: "SUBMITTED-TX-ID",
  submittedAt: "2026-09-12T12:00:00.000Z",
  createdAt: "2026-09-12T11:59:00.000Z",
};
const member: BatchEvidenceMemberRecord = {
  id: "member-1",
  batchId: submittedBatch.id,
  documentName: "recovered-document.txt",
  size: 4,
  lastModified: 1_788_000_000_000,
  hashAlgorithm: "SHA-256",
  hashValue: "b".repeat(64),
  occurrence: 0,
  leafIndex: 0,
  membershipProof: {
    algorithm: "adv-merkle-sha256-v1",
    root,
    documentHash: "b".repeat(64),
    occurrence: 0,
    leafIndex: 0,
    leafCount: 1,
    siblings: [],
  },
  createdAt: "2026-09-12T11:59:00.000Z",
};

describe("Batch Vault reload recovery", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("recovers a submitted batch and enables member sharing", async () => {
    vi.spyOn(BatchEvidenceRepository, "listBatchesAsync").mockResolvedValue([
      submittedBatch,
    ]);
    vi.spyOn(BatchEvidenceRepository, "listMembersAsync").mockResolvedValue([
      member,
    ]);
    const confirmedBatch: BatchEvidenceRecord = {
      ...submittedBatch,
      status: "confirmed",
      confirmedRound: 66840000,
      confirmedAt: "2026-09-12T12:05:00.000Z",
    };
    vi.spyOn(AlgorandBatchRecoveryService, "check").mockResolvedValue({
      batch: confirmedBatch,
      recovered: true,
      status: {
        transactionId: "SUBMITTED-TX-ID",
        status: "confirmed",
        confirmedRound: 66840000,
        poolError: null,
        message: "The transaction is confirmed on Algorand.",
      },
    });

    render(<BatchVaultSection />);

    fireEvent.click(await screen.findByText("1 documents"));
    const shareButton = screen.getByRole("button", {
      name: "Create verification link",
    });
    expect(shareButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Check batch confirmation" })
    );

    await waitFor(() => expect(shareButton).toBeEnabled());
    expect(
      screen.getByText(
        "Batch confirmation recovered. Verification links are now available."
      )
    ).toBeVisible();
    expect(AlgorandBatchRecoveryService.check).toHaveBeenCalledWith(
      submittedBatch
    );
  });
});
