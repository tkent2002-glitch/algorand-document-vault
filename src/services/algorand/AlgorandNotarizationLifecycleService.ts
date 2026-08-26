import { EvidenceRepository } from "../../repositories";
import type { EvidenceRecord } from "../notarization";
import { EvidenceRecordService } from "../notarization";
import type {
  AlgorandConfirmationResult,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
} from "../../types";
import { AlgorandConfirmationService } from "./AlgorandConfirmationService";
import { AlgorandSubmissionService } from "./AlgorandSubmissionService";

export type AlgorandNotarizationLifecycleStage =
  | "submitting"
  | "submitted"
  | "confirming"
  | "confirmed";

export type AlgorandNotarizationLifecycleProgress = {
  stage: AlgorandNotarizationLifecycleStage;
  message: string;
};

export type AlgorandNotarizationLifecycleInput = {
  signedTransaction: AlgorandSignedProofTransaction;
  evidenceRecord: EvidenceRecord;
  onProgress?: (
    progress: AlgorandNotarizationLifecycleProgress
  ) => void;
};

export type AlgorandNotarizationLifecycleResult = {
  submissionResult: AlgorandSubmissionResult;
  confirmationResult: AlgorandConfirmationResult;
  submittedRecord: EvidenceRecord;
  confirmedRecord: EvidenceRecord;
};

export class AlgorandNotarizationLifecycleError extends Error {
  readonly stage: AlgorandNotarizationLifecycleStage;
  readonly causeValue: unknown;
  readonly transactionId: string | null;

  constructor(
    stage: AlgorandNotarizationLifecycleStage,
    message: string,
    causeValue: unknown,
    transactionId: string | null = null
  ) {
    super(message);

    this.name = "AlgorandNotarizationLifecycleError";
    this.stage = stage;
    this.causeValue = causeValue;
    this.transactionId = transactionId;
  }
}

export class AlgorandNotarizationLifecycleService {
  static async complete(
    input: AlgorandNotarizationLifecycleInput
  ): Promise<AlgorandNotarizationLifecycleResult> {
    let currentStage: AlgorandNotarizationLifecycleStage =
      "submitting";

    let transactionId: string | null = null;

    const report = (
      stage: AlgorandNotarizationLifecycleStage,
      message: string
    ): void => {
      currentStage = stage;
      input.onProgress?.({ stage, message });
    };

    try {
      report(
        "submitting",
        "Submitting signed transaction to Algorand TestNet..."
      );

      const submissionResult =
        await AlgorandSubmissionService.submitSignedTransaction(
          input.signedTransaction.signedTransaction
        );

      transactionId = submissionResult.transactionId;

      const submittedRecord =
        EvidenceRecordService.markSubmitted(
          input.evidenceRecord,
          submissionResult
        );

      await EvidenceRepository.saveAsync(submittedRecord);

      report(
        "submitted",
        "Transaction submitted to Algorand TestNet."
      );

      report(
        "confirming",
        "Waiting for Algorand TestNet confirmation..."
      );

      const confirmationResult =
        await AlgorandConfirmationService.waitForConfirmation(
          submissionResult.transactionId
        );

      const confirmedRecord =
        EvidenceRecordService.markConfirmed(
          submittedRecord,
          confirmationResult
        );

      await EvidenceRepository.saveAsync(confirmedRecord);

      report(
        "confirmed",
        "Transaction confirmed on Algorand TestNet."
      );

      return {
        submissionResult,
        confirmationResult,
        submittedRecord,
        confirmedRecord,
      };
    } catch (error) {
      throw new AlgorandNotarizationLifecycleError(
        currentStage,
        `Algorand notarization failed during the ${currentStage} stage.`,
        error,
        transactionId
      );
    }
  }
}
