import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  TransactionFailureClassification,
} from "../../src/services/algorand/TransactionFailureClassificationService";
import { AlgorandTransactionStatusService } from "../../src/services/algorand/AlgorandTransactionStatusService";
import { TransactionRecoveryDecisionService } from "../../src/services/algorand/TransactionRecoveryDecisionService";

function createFailure(
  type: TransactionFailureClassification["type"],
  stage: TransactionFailureClassification["stage"]
): TransactionFailureClassification {
  return {
    type,
    stage,
    userMessage: "Test failure",
    originalError: new Error("Test failure"),
  };
}

describe("TransactionRecoveryDecisionService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows retry after wallet rejection", async () => {
    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "wallet_rejected",
          "signing"
        ),
      });

    expect(result.decision).toBe("safe_to_retry");
    expect(result.statusResult).toBeNull();
  });

  it("requires connectivity recovery for network failure before submission", async () => {
    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "network_unavailable",
          "submitting"
        ),
      });

    expect(result.decision).toBe(
      "status_unavailable"
    );
  });

  it("requires manual review when transaction may have been submitted but no id exists", async () => {
    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "submission_failed",
          "submitting"
        ),
      });

    expect(result.decision).toBe(
      "manual_review_required"
    );
    expect(result.transactionId).toBeNull();
  });

  it("returns confirmed when Algorand confirms the transaction", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "confirmed",
      confirmedRound: 123,
      poolError: null,
      message: "Confirmed",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "confirmation_timeout",
          "confirming"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe("confirmed");
    expect(
      result.statusResult?.confirmedRound
    ).toBe(123);
  });

  it("keeps waiting when transaction is pending", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "pending",
      confirmedRound: null,
      poolError: null,
      message: "Pending",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "confirmation_timeout",
          "confirming"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe("keep_waiting");
  });

  it("requires manual review when transaction is rejected", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "rejected",
      confirmedRound: null,
      poolError: "overspend",
      message: "Rejected",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "submission_failed",
          "submitting"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe(
      "manual_review_required"
    );
  });

  it("does not treat not-found as safe to retry", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "not_found",
      confirmedRound: null,
      poolError: null,
      message: "Not found",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "confirmation_timeout",
          "confirming"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe(
      "manual_review_required"
    );
  });

  it("never confirms recovery when the on-chain transaction mismatches the proof", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "mismatch",
      confirmedRound: 123,
      poolError: null,
      message:
        "The confirmed transaction does not match this document proof. The Vault record was not confirmed.",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "confirmation_timeout",
          "confirming"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe("manual_review_required");
    expect(result.userMessage).toContain(
      "Vault record was not confirmed"
    );
  });

  it("blocks retry when status lookup is unavailable", async () => {
    vi.spyOn(
      AlgorandTransactionStatusService,
      "check"
    ).mockResolvedValue({
      transactionId: "TX-ID",
      status: "unavailable",
      confirmedRound: null,
      poolError: null,
      message: "Unavailable",
    });

    const result =
      await TransactionRecoveryDecisionService.evaluate({
        failure: createFailure(
          "confirmation_timeout",
          "confirming"
        ),
        transactionId: "TX-ID",
      });

    expect(result.decision).toBe(
      "status_unavailable"
    );
  });
});
