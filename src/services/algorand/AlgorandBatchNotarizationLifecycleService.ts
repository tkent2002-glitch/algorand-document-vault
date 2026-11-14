import { BatchEvidenceRepository } from "../../repositories/evidence/BatchEvidenceRepository";
import type { BatchEvidenceRecord } from "../notarization";
import { BatchEvidenceRecordService } from "../notarization";
import type {
  AlgorandConfirmationResult,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
} from "../../types";
import { AlgorandConfirmationService } from "./AlgorandConfirmationService";
import {
  AlgorandNotarizationLifecycleError,
  type AlgorandNotarizationLifecycleProgress,
  type AlgorandNotarizationLifecycleStage,
} from "./AlgorandNotarizationLifecycleService";
import { AlgorandProofNoteService } from "./AlgorandProofNoteService";
import { AlgorandProofTransactionValidationService } from "./AlgorandProofTransactionValidationService";
import { AlgorandSubmissionService } from "./AlgorandSubmissionService";

export type AlgorandBatchNotarizationLifecycleInput = {
  signedTransaction: AlgorandSignedProofTransaction;
  batchRecord: BatchEvidenceRecord;
  expectedSenderAddress: string;
  onProgress?: (progress: AlgorandNotarizationLifecycleProgress) => void;
};

export type AlgorandBatchNotarizationLifecycleResult = {
  submissionResult: AlgorandSubmissionResult;
  confirmationResult: AlgorandConfirmationResult;
  submittedRecord: BatchEvidenceRecord;
  confirmedRecord: BatchEvidenceRecord;
};

export class AlgorandBatchNotarizationLifecycleService {
  static async complete(
    input: AlgorandBatchNotarizationLifecycleInput
  ): Promise<AlgorandBatchNotarizationLifecycleResult> {
    let stage: AlgorandNotarizationLifecycleStage = "submitting";
    let transactionId: string | null = null;
    const report = (
      nextStage: AlgorandNotarizationLifecycleStage,
      message: string
    ) => {
      stage = nextStage;
      input.onProgress?.({ stage: nextStage, message });
    };

    try {
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: input.signedTransaction.signedTransaction,
        expectedTransactionId: input.signedTransaction.txId,
        expectedSenderAddress: input.expectedSenderAddress,
        expectedNote: AlgorandProofNoteService.createNote(input.batchRecord.proof),
      });
      report("submitting", "Submitting Merkle batch anchor to Algorand TestNet...");
      const submissionResult = await AlgorandSubmissionService.submitSignedTransaction(
        input.signedTransaction.signedTransaction
      );
      transactionId = submissionResult.transactionId;
      if (transactionId !== input.signedTransaction.txId) {
        throw new Error("Submitted transaction ID does not match the signed batch transaction.");
      }

      const submittedRecord = BatchEvidenceRecordService.markSubmitted(
        input.batchRecord,
        submissionResult
      );
      await BatchEvidenceRepository.updateBatchAsync(submittedRecord);
      report("submitted", "Merkle batch anchor submitted to Algorand TestNet.");
      report("confirming", "Waiting for Algorand TestNet confirmation...");

      const confirmationResult = await AlgorandConfirmationService.waitForConfirmation(
        transactionId
      );
      const confirmedRecord = BatchEvidenceRecordService.markConfirmed(
        submittedRecord,
        confirmationResult
      );
      await BatchEvidenceRepository.updateBatchAsync(confirmedRecord);
      report("confirmed", "Merkle batch anchor confirmed on Algorand TestNet.");

      return {
        submissionResult,
        confirmationResult,
        submittedRecord,
        confirmedRecord,
      };
    } catch (error) {
      throw new AlgorandNotarizationLifecycleError(
        stage,
        `Algorand batch notarization failed during the ${stage} stage.`,
        error,
        transactionId
      );
    }
  }
}
