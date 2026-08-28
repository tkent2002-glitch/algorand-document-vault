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
    id: "record-recovery-test",
    status: "draft",
    documentName: "recovery-test.txt",
    hashAlgorithm: "SHA-256",
    hashValue: hash,
    proof: {
      id: "proof-recovery-test",
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

function createSignedTransaction(txId = "UNSIGNED-TX-ID"):
  AlgorandSignedProofTransaction {
  return {
    txId,
    signedTransaction: new Uint8Array([1, 2, 3]),
    signedTransactionByteLength: 3,
    signedAt: "2026-07-12T00:01:00.000Z",
  };
}

describe("Algorand lifecycle recovery boundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves the transaction id when confirmation fails", async () => {
    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockResolvedValue({
      transactionId: "RECOVERY-TX-ID",
      submittedAt: "2026-07-12T00:02:00.000Z",
    });

    vi.spyOn(
      EvidenceRepository,
      "saveAsync"
    ).mockResolvedValue();

    vi.spyOn(
      AlgorandConfirmationService,
      "waitForConfirmation"
    ).mockRejectedValue(
      new Error("Confirmation timed out")
    );

    try {
      await AlgorandNotarizationLifecycleService.complete({
        signedTransaction: createSignedTransaction("RECOVERY-TX-ID"),
        evidenceRecord: createEvidenceRecord(),
      });

      throw new Error("Expected lifecycle failure.");
    } catch (error) {
      expect(error).toBeInstanceOf(
        AlgorandNotarizationLifecycleError
      );

      const lifecycleError =
        error as AlgorandNotarizationLifecycleError;

      expect(lifecycleError.stage).toBe("confirming");
      expect(lifecycleError.transactionId).toBe(
        "RECOVERY-TX-ID"
      );
    }
  });

  it("has no transaction id when submission itself fails", async () => {
    vi.spyOn(
      AlgorandSubmissionService,
      "submitSignedTransaction"
    ).mockRejectedValue(
      new Error("Submission failed")
    );

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

      const lifecycleError =
        error as AlgorandNotarizationLifecycleError;

      expect(lifecycleError.stage).toBe("submitting");
      expect(lifecycleError.transactionId).toBeNull();
    }
  });
});
