import { beforeEach, describe, expect, it, vi } from "vitest";
import { BatchEvidenceRepository } from "../../src/repositories/evidence/BatchEvidenceRepository";
import { AlgorandBatchNotarizationLifecycleService } from "../../src/services/algorand/AlgorandBatchNotarizationLifecycleService";
import { AlgorandConfirmationService } from "../../src/services/algorand/AlgorandConfirmationService";
import { AlgorandProofTransactionValidationService } from "../../src/services/algorand/AlgorandProofTransactionValidationService";
import { AlgorandSubmissionService } from "../../src/services/algorand/AlgorandSubmissionService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";
import type { BatchEvidenceRecord } from "../../src/services/notarization";

const root = "a".repeat(64);

function createBatch(): BatchEvidenceRecord {
  return {
    id: "batch-1",
    status: "draft",
    merkleRoot: root,
    treeAlgorithm: "adv-merkle-sha256-v1",
    leafCount: 2,
    proof: NotarizationService.createMerkleBatchProof(root, 2),
    createdAt: "2026-09-12T00:00:00.000Z",
  };
}

const signed = {
  txId: "TESTNET-TX-ID",
  signedTransaction: new Uint8Array([1, 2, 3]),
  signedTransactionByteLength: 3,
  signedAt: "2026-09-12T00:01:00.000Z",
};

describe("AlgorandBatchNotarizationLifecycleService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(
      AlgorandProofTransactionValidationService,
      "decodeAndValidateSignedTransaction"
    ).mockReturnValue({} as never);
  });

  it("persists submitted and confirmed batch states", async () => {
    const update = vi.spyOn(BatchEvidenceRepository, "updateBatchAsync").mockResolvedValue();
    vi.spyOn(AlgorandSubmissionService, "submitSignedTransaction").mockResolvedValue({
      transactionId: signed.txId,
      submittedAt: "2026-09-12T00:02:00.000Z",
    });
    vi.spyOn(AlgorandConfirmationService, "waitForConfirmation").mockResolvedValue({
      transactionId: signed.txId,
      confirmedRound: 456,
      confirmedAt: "2026-09-12T00:03:00.000Z",
    });

    const result = await AlgorandBatchNotarizationLifecycleService.complete({
      signedTransaction: signed,
      batchRecord: createBatch(),
      expectedSenderAddress: "EXPECTED-SENDER",
    });

    expect(result.confirmedRecord.status).toBe("confirmed");
    expect(result.confirmedRecord.confirmedRound).toBe(456);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("never broadcasts wallet bytes that fail final batch-note validation", async () => {
    vi.mocked(
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction
    ).mockImplementation(() => {
      throw new Error("Wallet returned a substituted batch transaction.");
    });
    const submit = vi.spyOn(AlgorandSubmissionService, "submitSignedTransaction");

    await expect(
      AlgorandBatchNotarizationLifecycleService.complete({
        signedTransaction: signed,
        batchRecord: createBatch(),
        expectedSenderAddress: "EXPECTED-SENDER",
      })
    ).rejects.toMatchObject({ stage: "submitting", transactionId: null });
    expect(submit).not.toHaveBeenCalled();
  });
});
