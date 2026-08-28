import type {
  TransactionFailureClassification,
} from "./TransactionFailureClassificationService";
import { TransactionRetryPolicyService } from "./TransactionRetryPolicyService";
import {
  AlgorandTransactionStatusService,
  type AlgorandTransactionStatusResult,
} from "./AlgorandTransactionStatusService";

export type TransactionRecoveryDecision =
  | "confirmed"
  | "keep_waiting"
  | "safe_to_retry"
  | "manual_review_required"
  | "status_unavailable";

export type TransactionRecoveryResult = {
  decision: TransactionRecoveryDecision;
  transactionId: string | null;
  statusResult: AlgorandTransactionStatusResult | null;
  userMessage: string;
};

export type TransactionRecoveryInput = {
  failure: TransactionFailureClassification;
  transactionId?: string | null;
};

export class TransactionRecoveryDecisionService {
  static async evaluate(
    input: TransactionRecoveryInput
  ): Promise<TransactionRecoveryResult> {
    const retryPolicy =
      TransactionRetryPolicyService.evaluate(input.failure);

    const transactionId =
      input.transactionId?.trim() || null;

    if (
      retryPolicy.canRetryImmediately &&
      !retryPolicy.transactionMayHaveBeenSubmitted
    ) {
      return {
        decision: "safe_to_retry",
        transactionId,
        statusResult: null,
        userMessage: retryPolicy.userMessage,
      };
    }

    if (
      !retryPolicy.transactionMayHaveBeenSubmitted
    ) {
      return {
        decision: "status_unavailable",
        transactionId,
        statusResult: null,
        userMessage: retryPolicy.userMessage,
      };
    }

    if (!transactionId) {
      return {
        decision: "manual_review_required",
        transactionId: null,
        statusResult: null,
        userMessage:
          "The transaction may have been submitted, but no transaction ID is available. Do not retry automatically.",
      };
    }

    const statusResult =
      await AlgorandTransactionStatusService.check(
        transactionId
      );

    if (statusResult.status === "confirmed") {
      return {
        decision: "confirmed",
        transactionId,
        statusResult,
        userMessage:
          "The transaction is confirmed on Algorand. Do not submit another transaction.",
      };
    }

    if (statusResult.status === "pending") {
      return {
        decision: "keep_waiting",
        transactionId,
        statusResult,
        userMessage:
          "The transaction is still pending. Keep waiting and do not resubmit.",
      };
    }

    if (statusResult.status === "rejected") {
      return {
        decision: "manual_review_required",
        transactionId,
        statusResult,
        userMessage:
          "The Algorand node reports that the transaction was rejected. Review the rejection reason before retrying.",
      };
    }

    if (statusResult.status === "not_found") {
      return {
        decision: "manual_review_required",
        transactionId,
        statusResult,
        userMessage:
          "The transaction was not found. This alone does not prove that resubmission is safe.",
      };
    }

    return {
      decision: "status_unavailable",
      transactionId,
      statusResult,
      userMessage:
        "Transaction status could not be verified. Do not resubmit until status can be checked.",
    };
  }
}
