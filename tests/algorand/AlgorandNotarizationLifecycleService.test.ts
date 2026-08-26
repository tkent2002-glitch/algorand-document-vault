import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceRepository } from "../../src/repositories";
import {
  AlgorandNotarizationLifecycleError,
  AlgorandNotarizationLifecycleService,
} from "../../src/services/algorand/AlgorandNotarizationLifecycleService";
import { AlgorandConfirmationService } from "../../src/services/algorand/AlgorandConfirmationService";
import { AlgorandSubmissionService } from "../../src/services/algorand/AlgorandSubmissionService";
import type { EvidenceRecord } from "../../src/services";
import type { AlgorandSignedProofTransaction } from "../../src/types";

const hash =
  "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

function createEvidenceRecord(): EvidenceRecord {
  return {
    id: "record-1",
    status: "draft",
    documentName: "test.txt",
    hashAlgorithm: "SHA-256",
    hashValue: hash,
    proof: {
      id: "proof-1",
      status: "created",
      payload: {
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value: hash,
        },
        createdAt: "2026-07-12T00:00:00.000Z",
      },
      createdAt: "2026-07-12T00:00:00.000Z",
    },
    createdAt: "2026-07-12T00:00:00.000Z",
  };
}

function createSignedTransaction():
  AlgorandSignedProofTransaction {
  return {
    txId: "UNSIGNED-TX-ID",
    signedTransaction: new Uint8Array([1, 2, 3]),
    signedTransactionByteLength: 3,
    signedAt: "2026-07-12T00:01:00.000Z",
  };
}

describe("AlgorandNotarizationLifecycleService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits, confirms, and persists the complete lifecycle", async () => {
    const saveSpy = vi
      .spyOn(EvidenceRepository, "saveAsync")
      .mockResolvedValue();

    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockResolvedValue({
      transactionId: "TESTNET-TX-ID",
      submittedAt: "2026-07-12T00:02:00.000Z",
    });

    vi.spyOn(
      AlgorandConfirmationService,
      "waitForConfirmation"
    ).mockResolvedValue({
      transactionId: "TESTNET-TX-ID",
      confirmedRound: 123456,
      confirmedAt: "2026-07-12T00:03:00.000Z",
    });

    const progress = vi.fn();

    const result =
      await AlgorandNotarizationLifecycleService.complete({
        signedTransaction: createSignedTransaction(),
        evidenceRecord: createEvidenceRecord(),
        onProgress: progress,
      });

    expect(result.submissionResult.transactionId).toBe(
      "TESTNET-TX-ID"
    );

    expect(result.confirmationResult.confirmedRound).toBe(
      123456
    );

    expect(result.submittedRecord.status).toBe("submitted");
    expect(result.confirmedRecord.status).toBe("confirmed");

    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(progress).toHaveBeenCalledTimes(4);

    expect(progress).toHaveBeenNthCalledWith(1, {
      stage: "submitting",
      message:
        "Submitting signed transaction to Algorand TestNet...",
    });

    expect(progress).toHaveBeenNthCalledWith(4, {
      stage: "confirmed",
      message:
        "Transaction confirmed on Algorand TestNet.",
    });
  });

  it("reports the submission stage when submission fails", async () => {
    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockRejectedValue(new Error("Network unavailable"));

    await expect(
      AlgorandNotarizationLifecycleService.complete({
        signedTransaction: createSignedTransaction(),
        evidenceRecord: createEvidenceRecord(),
      })
    ).rejects.toMatchObject({
      name: "AlgorandNotarizationLifecycleError",
      stage: "submitting",
    });
  });

  it("reports the confirming stage when confirmation fails", async () => {
    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockResolvedValue({
      transactionId: "TESTNET-TX-ID",
      submittedAt: "2026-07-12T00:02:00.000Z",
    });

    vi.spyOn(
      EvidenceRepository,
      "saveAsync"
    ).mockResolvedValue();

    vi.spyOn(
      AlgorandConfirmationService,
      "waitForConfirmation"
    ).mockRejectedValue(new Error("Confirmation timed out"));

    try {
      await AlgorandNotarizationLifecycleService.complete({
        signedTransaction: createSignedTransaction(),
        evidenceRecord: createEvidenceRecord(),
      });

      throw new Error("Expected lifecycle failure.");
    } catch (error) {
      expect(error).toBeInstanceOf(
        AlgorandNotarizationLifecycleError
      );

      expect(
        (error as AlgorandNotarizationLifecycleError).stage
      ).toBe("confirming");
    }
  });
});
