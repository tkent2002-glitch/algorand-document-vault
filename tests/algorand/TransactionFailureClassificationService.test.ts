import { describe, expect, it } from "vitest";
import { TransactionFailureClassificationService } from "../../src/services/algorand/TransactionFailureClassificationService";

describe("TransactionFailureClassificationService", () => {
  it("classifies a rejected wallet signature", () => {
    const error = new Error(
      "User rejected the transaction request."
    );

    const result =
      TransactionFailureClassificationService.classify(
        error,
        { stage: "signing" }
      );

    expect(result.type).toBe("wallet_rejected");
    expect(result.stage).toBe("signing");
    expect(result.originalError).toBe(error);
  });

  it("classifies a cancelled wallet signature", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error("Transaction cancelled by user."),
        { stage: "signing" }
      );

    expect(result.type).toBe("wallet_rejected");
  });

  it("classifies an unresponsive wallet before generic cancellation text", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error(
          "Wallet approval wait was cancelled by the application."
        ),
        { stage: "signing" }
      );

    expect(result.type).toBe("wallet_unresponsive");
    expect(result.userMessage).toContain("No transaction was submitted");
  });

  it("classifies a network failure", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new TypeError("Failed to fetch"),
        { stage: "submitting" }
      );

    expect(result.type).toBe("network_unavailable");
    expect(result.stage).toBe("submitting");
  });

  it("classifies a confirmation timeout", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error(
          "Timed out waiting for confirmation."
        ),
        { stage: "confirming" }
      );

    expect(result.type).toBe("confirmation_timeout");
    expect(result.stage).toBe("confirming");
  });

  it("classifies an unrecognized submission error", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error("Algod rejected transaction."),
        { stage: "submitting" }
      );

    expect(result.type).toBe("submission_failed");
    expect(result.stage).toBe("submitting");
  });

  it("classifies an unrecognized error as unknown", () => {
    const error = new Error("Unexpected provider response.");

    const result =
      TransactionFailureClassificationService.classify(
        error
      );

    expect(result.type).toBe("unknown");
    expect(result.stage).toBe("unknown");
    expect(result.originalError).toBe(error);
  });

  it("does not classify rejection text outside signing as wallet rejection", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error("Transaction rejected by node."),
        { stage: "submitting" }
      );

    expect(result.type).toBe("submission_failed");
  });

  it("does not classify a generic timeout outside confirmation as confirmation timeout", () => {
    const result =
      TransactionFailureClassificationService.classify(
        new Error("Request timed out."),
        { stage: "submitting" }
      );

    expect(result.type).toBe("submission_failed");
  });

  it("accepts string errors without throwing", () => {
    const result =
      TransactionFailureClassificationService.classify(
        "Network error",
        { stage: "submitting" }
      );

    expect(result.type).toBe("network_unavailable");
  });

  it("accepts non-Error values without throwing", () => {
    const result =
      TransactionFailureClassificationService.classify(
        { unexpected: true },
        { stage: "unknown" }
      );

    expect(result.type).toBe("unknown");
  });
});
