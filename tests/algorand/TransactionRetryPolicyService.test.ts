import { describe, expect, it } from "vitest";
import type {
  TransactionFailureClassification,
  TransactionFailureType,
  TransactionFailureStage,
} from "../../src/services/algorand/TransactionFailureClassificationService";
import { TransactionRetryPolicyService } from "../../src/services/algorand/TransactionRetryPolicyService";

function createFailure(
  type: TransactionFailureType,
  stage: TransactionFailureStage
): TransactionFailureClassification {
  return {
    type,
    stage,
    userMessage: "Test failure.",
    originalError: new Error("Test failure."),
  };
}

describe("TransactionRetryPolicyService", () => {
  it("allows another signing attempt after wallet rejection", () => {
    const policy = TransactionRetryPolicyService.evaluate(
      createFailure("wallet_rejected", "signing")
    );

    expect(policy.decision).toBe("retry_allowed");
    expect(policy.canRetryImmediately).toBe(true);
    expect(policy.transactionMayHaveBeenSubmitted).toBe(false);
  });

  it("waits for connectivity after a network failure", () => {
    const policy = TransactionRetryPolicyService.evaluate(
      createFailure("network_unavailable", "submitting")
    );

    expect(policy.decision).toBe(
      "retry_after_connectivity_restored"
    );
    expect(policy.canRetryImmediately).toBe(false);
    expect(policy.transactionMayHaveBeenSubmitted).toBe(false);
  });

  it("blocks blind retry after a submission failure", () => {
    const policy = TransactionRetryPolicyService.evaluate(
      createFailure("submission_failed", "submitting")
    );

    expect(policy.decision).toBe("manual_review_required");
    expect(policy.canRetryImmediately).toBe(false);
    expect(policy.transactionMayHaveBeenSubmitted).toBe(true);
  });

  it("requires transaction verification after confirmation timeout", () => {
    const policy = TransactionRetryPolicyService.evaluate(
      createFailure("confirmation_timeout", "confirming")
    );

    expect(policy.decision).toBe(
      "verify_transaction_before_retry"
    );
    expect(policy.canRetryImmediately).toBe(false);
    expect(policy.transactionMayHaveBeenSubmitted).toBe(true);
  });

  it("uses the conservative policy for unknown failures", () => {
    const policy = TransactionRetryPolicyService.evaluate(
      createFailure("unknown", "unknown")
    );

    expect(policy.decision).toBe("manual_review_required");
    expect(policy.canRetryImmediately).toBe(false);
    expect(policy.transactionMayHaveBeenSubmitted).toBe(true);
  });

  it("never permits immediate retry when submission may have occurred", () => {
    const failureTypes: TransactionFailureType[] = [
      "submission_failed",
      "confirmation_timeout",
      "unknown",
    ];

    for (const type of failureTypes) {
      const policy = TransactionRetryPolicyService.evaluate(
        createFailure(type, "unknown")
      );

      expect(policy.transactionMayHaveBeenSubmitted).toBe(true);
      expect(policy.canRetryImmediately).toBe(false);
    }
  });
});
