import { AlgorandService } from "./AlgorandService";

export type AlgorandTransactionLookupStatus =
  | "confirmed"
  | "pending"
  | "rejected"
  | "not_found"
  | "unavailable";

export type AlgorandTransactionStatusResult = {
  transactionId: string;
  status: AlgorandTransactionLookupStatus;
  confirmedRound: number | null;
  poolError: string | null;
  message: string;
};

function getHttpStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const candidate = error as {
    status?: unknown;
    response?: {
      status?: unknown;
    };
  };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  if (
    candidate.response &&
    typeof candidate.response.status === "number"
  ) {
    return candidate.response.status;
  }

  return null;
}

export class AlgorandTransactionStatusService {
  static async check(
    transactionId: string
  ): Promise<AlgorandTransactionStatusResult> {
    const normalizedTransactionId = transactionId.trim();

    if (!normalizedTransactionId) {
      throw new Error(
        "Transaction ID is required for status verification."
      );
    }

    const client = AlgorandService.createAlgodClient();

    try {
      const pendingInfo =
        await client
          .pendingTransactionInformation(normalizedTransactionId)
          .do();

      const confirmedRound = Number(
        pendingInfo.confirmedRound ?? 0
      );

      const poolError =
        typeof pendingInfo.poolError === "string"
          ? pendingInfo.poolError.trim()
          : "";

      if (confirmedRound > 0) {
        return {
          transactionId: normalizedTransactionId,
          status: "confirmed",
          confirmedRound,
          poolError: null,
          message:
            "The transaction is confirmed on Algorand.",
        };
      }

      if (poolError.length > 0) {
        return {
          transactionId: normalizedTransactionId,
          status: "rejected",
          confirmedRound: null,
          poolError,
          message:
            "The Algorand node reports that the transaction was rejected.",
        };
      }

      return {
        transactionId: normalizedTransactionId,
        status: "pending",
        confirmedRound: null,
        poolError: null,
        message:
          "The transaction is known to the Algorand node but is not yet confirmed.",
      };
    } catch (error) {
      const httpStatus = getHttpStatus(error);

      if (httpStatus === 404) {
        return {
          transactionId: normalizedTransactionId,
          status: "not_found",
          confirmedRound: null,
          poolError: null,
          message:
            "The transaction was not found by the Algorand node. This does not by itself prove that resubmission is safe.",
        };
      }

      console.error(
        "Algorand transaction status verification failed:",
        error
      );

      return {
        transactionId: normalizedTransactionId,
        status: "unavailable",
        confirmedRound: null,
        poolError: null,
        message:
          "Transaction status could not be verified because the Algorand node is unavailable or returned an unexpected error.",
      };
    }
  }
}
