import { beforeEach, describe, expect, it, vi } from "vitest";
import { EvidenceRepository } from "../../src/repositories";
import {
  AlgorandNotarizationLifecycleError,
  AlgorandNotarizationLifecycleService,
} from "../../src/services/algorand/AlgorandNotarizationLifecycleService";
import { AlgorandConfirmationService } from "../../src/services/algorand/AlgorandConfirmationService";
import { AlgorandSubmissionService } from "../../src/services/algorand/AlgorandSubmissionService";
import { AlgorandProofTransactionValidationService } from "../../src/services/algorand/AlgorandProofTransactionValidationService";
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
    txId: "TESTNET-TX-ID",
    signedTransaction: new Uint8Array([1, 2, 3]),
    signedTransactionByteLength: 3,
    signedAt: "2026-07-12T00:01:00.000Z",
  };
}

describe("AlgorandNotarizationLifecycleService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(
      AlgorandProofTransactionValidationService,
      "decodeAndValidateSignedTransaction"
    ).mockReturnValue({} as never);
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
        expectedSenderAddress: "EXPECTED-SENDER",
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
        expectedSenderAddress: "EXPECTED-SENDER",
      })
    ).rejects.toMatchObject({
      name: "AlgorandNotarizationLifecycleError",
      stage: "submitting",
    });
  });

  it("never submits wallet bytes that fail final proof validation", async () => {
    vi.mocked(
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction
    ).mockImplementation(() => {
      throw new Error("Wallet transaction does not match the prepared proof.");
    });
    const submitSpy = vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    );

    await expect(
      AlgorandNotarizationLifecycleService.complete({
        signedTransaction: createSignedTransaction(),
        evidenceRecord: createEvidenceRecord(),
        expectedSenderAddress: "EXPECTED-SENDER",
      })
    ).rejects.toMatchObject({
      stage: "submitting",
      transactionId: null,
    });

    expect(submitSpy).not.toHaveBeenCalled();
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
        expectedSenderAddress: "EXPECTED-SENDER",
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

  it("rejects a submitted transaction id that does not match the signed transaction", async () => {
    const saveSpy = vi
      .spyOn(EvidenceRepository, "saveAsync")
      .mockResolvedValue();

    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockResolvedValue({
      transactionId: "DIFFERENT-TX-ID",
      submittedAt: "2026-07-12T00:02:00.000Z",
    });

    const confirmationSpy = vi
      .spyOn(
        AlgorandConfirmationService,
        "waitForConfirmation"
      )
      .mockResolvedValue({
        transactionId: "DIFFERENT-TX-ID",
        confirmedRound: 123456,
        confirmedAt: "2026-07-12T00:03:00.000Z",
      });

    try {
      await AlgorandNotarizationLifecycleService.complete({
        signedTransaction: {
          ...createSignedTransaction(),
          txId: "EXPECTED-TX-ID",
        },
        evidenceRecord: createEvidenceRecord(),
        expectedSenderAddress: "EXPECTED-SENDER",
      });

      throw new Error("Expected transaction ID mismatch.");
    } catch (error) {
      expect(error).toBeInstanceOf(
        AlgorandNotarizationLifecycleError
      );

      const lifecycleError =
        error as AlgorandNotarizationLifecycleError;

      expect(lifecycleError.stage).toBe("submitting");
      expect(lifecycleError.transactionId).toBe(
        "DIFFERENT-TX-ID"
      );
      expect(lifecycleError.causeValue).toBeInstanceOf(Error);
      expect(
        (lifecycleError.causeValue as Error).message
      ).toBe(
        "Submitted transaction ID does not match the ADv signed transaction ID."
      );
    }

    expect(saveSpy).not.toHaveBeenCalled();
    expect(confirmationSpy).not.toHaveBeenCalled();
  });
});
