export type TransactionFailureType =
  | "wallet_rejected"
  | "wallet_unresponsive"
  | "network_unavailable"
  | "submission_failed"
  | "confirmation_timeout"
  | "unknown";

export type TransactionFailureStage =
  | "signing"
  | "submitting"
  | "confirming"
  | "unknown";

export type TransactionFailureClassification = {
  type: TransactionFailureType;
  stage: TransactionFailureStage;
  userMessage: string;
  originalError: unknown;
};

export type TransactionFailureContext = {
  stage?: TransactionFailureStage;
};

const WALLET_REJECTION_PATTERNS = [
  "rejected",
  "cancelled",
  "canceled",
  "declined",
  "user rejected",
  "user denied",
];

const WALLET_UNRESPONSIVE_PATTERNS = [
  "wallet approval timed out",
  "wallet approval wait was cancelled",
];

const NETWORK_FAILURE_PATTERNS = [
  "failed to fetch",
  "networkerror",
  "network error",
  "network request failed",
  "connection refused",
  "connection reset",
  "unable to connect",
  "offline",
];

const CONFIRMATION_TIMEOUT_PATTERNS = [
  "confirmation timed out",
  "confirmation timeout",
  "timed out waiting for confirmation",
  "timeout waiting for confirmation",
  "transaction not confirmed",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

function containsPattern(
  message: string,
  patterns: string[]
): boolean {
  const normalizedMessage = message.toLowerCase();

  return patterns.some((pattern) =>
    normalizedMessage.includes(pattern)
  );
}

export class TransactionFailureClassificationService {
  static classify(
    error: unknown,
    context: TransactionFailureContext = {}
  ): TransactionFailureClassification {
    const stage = context.stage ?? "unknown";
    const message = getErrorMessage(error);

    if (
      stage === "signing" &&
      containsPattern(message, WALLET_UNRESPONSIVE_PATTERNS)
    ) {
      return {
        type: "wallet_unresponsive",
        stage,
        userMessage:
          "The wallet approval request did not complete. No transaction was submitted.",
        originalError: error,
      };
    }

    if (
      stage === "signing" &&
      containsPattern(message, WALLET_REJECTION_PATTERNS)
    ) {
      return {
        type: "wallet_rejected",
        stage,
        userMessage:
          "The wallet signature request was cancelled or rejected.",
        originalError: error,
      };
    }

    if (
      containsPattern(message, NETWORK_FAILURE_PATTERNS)
    ) {
      return {
        type: "network_unavailable",
        stage,
        userMessage:
          "The Algorand network service could not be reached.",
        originalError: error,
      };
    }

    if (
      stage === "confirming" &&
      containsPattern(message, CONFIRMATION_TIMEOUT_PATTERNS)
    ) {
      return {
        type: "confirmation_timeout",
        stage,
        userMessage:
          "The transaction was submitted, but confirmation could not be verified before the timeout.",
        originalError: error,
      };
    }

    if (stage === "submitting") {
      return {
        type: "submission_failed",
        stage,
        userMessage:
          "The signed transaction could not be submitted to the Algorand network.",
        originalError: error,
      };
    }

    return {
      type: "unknown",
      stage,
      userMessage:
        "An unexpected transaction error occurred.",
      originalError: error,
    };
  }
}
