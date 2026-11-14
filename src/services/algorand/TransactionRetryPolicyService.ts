import type {
  TransactionFailureClassification,
  TransactionFailureType,
} from "./TransactionFailureClassificationService";

export type TransactionRetryDecision =
  | "retry_allowed"
  | "retry_after_connectivity_restored"
  | "verify_transaction_before_retry"
  | "manual_review_required";

export type TransactionRetryPolicy = {
  decision: TransactionRetryDecision;
  canRetryImmediately: boolean;
  transactionMayHaveBeenSubmitted: boolean;
  userMessage: string;
};

const RETRY_POLICIES: Record<
  TransactionFailureType,
  Omit<TransactionRetryPolicy, "userMessage"> & {
    userMessage: string;
  }
> = {
  wallet_rejected: {
    decision: "retry_allowed",
    canRetryImmediately: true,
    transactionMayHaveBeenSubmitted: false,
    userMessage:
      "The wallet signature was not completed. No transaction was submitted, so signing may be attempted again.",
  },

  wallet_unresponsive: {
    decision: "retry_allowed",
    canRetryImmediately: true,
    transactionMayHaveBeenSubmitted: false,
    userMessage:
      "The wallet request ended before signing. Reopen Pera Wallet and try again. If no request appears, disconnect and reconnect Pera on this page.",
  },

  network_unavailable: {
    decision: "retry_after_connectivity_restored",
    canRetryImmediately: false,
    transactionMayHaveBeenSubmitted: false,
    userMessage:
      "Network connectivity must be restored before retrying.",
  },

  submission_failed: {
    decision: "manual_review_required",
    canRetryImmediately: false,
    transactionMayHaveBeenSubmitted: true,
    userMessage:
      "Submission status is uncertain. Do not resubmit until the transaction status has been checked.",
  },

  confirmation_timeout: {
    decision: "verify_transaction_before_retry",
    canRetryImmediately: false,
    transactionMayHaveBeenSubmitted: true,
    userMessage:
      "The transaction may already be on-chain. Verify its transaction status before attempting another submission.",
  },

  unknown: {
    decision: "manual_review_required",
    canRetryImmediately: false,
    transactionMayHaveBeenSubmitted: true,
    userMessage:
      "The transaction state is uncertain. Do not retry until its status has been reviewed.",
  },
};

export class TransactionRetryPolicyService {
  static evaluate(
    failure: TransactionFailureClassification
  ): TransactionRetryPolicy {
    const policy = RETRY_POLICIES[failure.type];

    return {
      decision: policy.decision,
      canRetryImmediately: policy.canRetryImmediately,
      transactionMayHaveBeenSubmitted:
        policy.transactionMayHaveBeenSubmitted,
      userMessage: policy.userMessage,
    };
  }
}
