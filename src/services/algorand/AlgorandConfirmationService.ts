import algosdk from "algosdk";
import type { AlgorandConfirmationResult } from "../../types";
import { AlgorandService } from "./AlgorandService";

const CONFIRMATION_WAIT_ROUNDS = 10;

export class AlgorandConfirmationService {
  static async waitForConfirmation(
    transactionId: string
  ): Promise<AlgorandConfirmationResult> {
    const client = AlgorandService.createAlgodClient();

    const confirmation = await algosdk.waitForConfirmation(
      client,
      transactionId,
      CONFIRMATION_WAIT_ROUNDS
    );

    return {
      transactionId,
      confirmedRound: Number(confirmation.confirmedRound),
      confirmedAt: new Date().toISOString(),
    };
  }
}
