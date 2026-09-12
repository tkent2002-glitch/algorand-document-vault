import { beforeEach, describe, expect, it, vi } from "vitest";
import { BatchEvidenceRepository } from "../../src/repositories/evidence/BatchEvidenceRepository";
import { AlgorandBatchRecoveryService } from "../../src/services/algorand/AlgorandBatchRecoveryService";
import { AlgorandTransactionStatusService } from "../../src/services/algorand/AlgorandTransactionStatusService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";
import type { BatchEvidenceRecord } from "../../src/services/notarization";

function createSubmittedBatch(): BatchEvidenceRecord {
  const root = "a".repeat(64);
  return {
    id: "recoverable-batch",
    status: "submitted",
    merkleRoot: root,
    treeAlgorithm: "adv-merkle-sha256-v1",
    leafCount: 3,
    proof: NotarizationService.createMerkleBatchProof(root, 3),
    algorandTransactionId: "RECOVERABLE-TX-ID",
    submittedAt: "2026-09-12T12:00:00.000Z",
    createdAt: "2026-09-12T11:59:00.000Z",
  };
}

describe("AlgorandBatchRecoveryService", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("confirms and persists a proof-bound submitted batch", async () => {
    vi.spyOn(AlgorandTransactionStatusService, "check").mockResolvedValue({
      transactionId: "RECOVERABLE-TX-ID",
      status: "confirmed",
      confirmedRound: 66840000,
      poolError: null,
      message: "The transaction is confirmed on Algorand.",
    });
    const update = vi
      .spyOn(BatchEvidenceRepository, "updateBatchAsync")
      .mockResolvedValue();

    const batch = createSubmittedBatch();
    const result = await AlgorandBatchRecoveryService.check(batch);

    expect(result.recovered).toBe(true);
    expect(result.batch).toMatchObject({
      status: "confirmed",
      confirmedRound: 66840000,
      algorandTransactionId: "RECOVERABLE-TX-ID",
    });
    expect(AlgorandTransactionStatusService.check).toHaveBeenCalledWith(
      "RECOVERABLE-TX-ID",
      { proof: batch.proof }
    );
    expect(update).toHaveBeenCalledWith(result.batch);
  });

  it.each(["pending", "mismatch", "not_found", "unavailable"] as const)(
    "does not modify the Vault when status is %s",
    async (status) => {
      vi.spyOn(AlgorandTransactionStatusService, "check").mockResolvedValue({
        transactionId: "RECOVERABLE-TX-ID",
        status,
        confirmedRound: status === "mismatch" ? 66840000 : null,
        poolError: null,
        message: `Recovery status: ${status}`,
      });
      const update = vi.spyOn(BatchEvidenceRepository, "updateBatchAsync");

      const result = await AlgorandBatchRecoveryService.check(
        createSubmittedBatch()
      );

      expect(result.recovered).toBe(false);
      expect(result.batch.status).toBe("submitted");
      expect(update).not.toHaveBeenCalled();
    }
  );

  it("rejects recovery without a persisted submitted transaction", async () => {
    const batch = { ...createSubmittedBatch(), status: "draft" as const };
    await expect(AlgorandBatchRecoveryService.check(batch)).rejects.toThrow(
      "Only a submitted Merkle batch"
    );
  });
});
