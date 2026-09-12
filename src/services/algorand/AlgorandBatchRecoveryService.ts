import { BatchEvidenceRepository } from "../../repositories/evidence/BatchEvidenceRepository";
import type { BatchEvidenceRecord } from "../notarization";
import { BatchEvidenceRecordService } from "../notarization";
import {
  AlgorandTransactionStatusService,
  type AlgorandTransactionStatusResult,
} from "./AlgorandTransactionStatusService";

export type AlgorandBatchRecoveryResult = {
  batch: BatchEvidenceRecord;
  status: AlgorandTransactionStatusResult;
  recovered: boolean;
};

export class AlgorandBatchRecoveryService {
  static async check(
    batch: BatchEvidenceRecord
  ): Promise<AlgorandBatchRecoveryResult> {
    if (batch.status !== "submitted" || !batch.algorandTransactionId) {
      throw new Error("Only a submitted Merkle batch can be recovered.");
    }

    const status = await AlgorandTransactionStatusService.check(
      batch.algorandTransactionId,
      { proof: batch.proof }
    );

    if (status.status !== "confirmed" || !status.confirmedRound) {
      return { batch, status, recovered: false };
    }

    const recovered = BatchEvidenceRecordService.markConfirmed(batch, {
      transactionId: batch.algorandTransactionId,
      confirmedRound: status.confirmedRound,
      confirmedAt: new Date().toISOString(),
    });
    await BatchEvidenceRepository.updateBatchAsync(recovered);

    return { batch: recovered, status, recovered: true };
  }
}
