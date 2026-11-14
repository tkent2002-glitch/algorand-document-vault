import algosdk from "algosdk";
import type { Transaction } from "algosdk";
import { AlgorandTransactionPolicyService } from "./AlgorandTransactionPolicyService";

export type AlgorandProofTransactionValidationInput = {
  transaction: Transaction;
  expectedTransactionId: string;
  expectedSenderAddress: string;
  expectedNote: Uint8Array;
};

export type AlgorandProofTransactionValidationResult = {
  valid: boolean;
  errors: string[];
};

export type AlgorandSignedProofTransactionValidationInput = Omit<
  AlgorandProofTransactionValidationInput,
  "transaction"
> & {
  signedTransaction: Uint8Array;
};

export class AlgorandProofTransactionValidationService {
  static validateTransaction(
    input: AlgorandProofTransactionValidationInput
  ): AlgorandProofTransactionValidationResult {
    const errors = [
      ...AlgorandTransactionPolicyService.validate({
        transaction: input.transaction,
        expectedSenderAddress: input.expectedSenderAddress,
        expectedNote: input.expectedNote,
      }).errors,
    ];

    if (input.transaction.txID() !== input.expectedTransactionId) {
      errors.push(
        "Transaction ID does not match the expected ADv proof transaction."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static assertValidTransaction(
    input: AlgorandProofTransactionValidationInput
  ): void {
    const result = this.validateTransaction(input);

    if (!result.valid) {
      throw new Error(
        `Algorand transaction rejected by ADv proof validation: ${result.errors.join(
          " "
        )}`
      );
    }
  }

  static decodeAndValidateSignedTransaction(
    input: AlgorandSignedProofTransactionValidationInput
  ): Transaction {
    let decoded;

    try {
      decoded = algosdk.decodeSignedTransaction(input.signedTransaction);
    } catch {
      throw new Error(
        "Wallet returned a malformed signed transaction. Nothing was submitted."
      );
    }

    if (!decoded.sig && !decoded.msig && !decoded.lsig) {
      throw new Error(
        "Wallet returned a transaction without a signature. Nothing was submitted."
      );
    }

    this.assertValidTransaction({
      transaction: decoded.txn,
      expectedTransactionId: input.expectedTransactionId,
      expectedSenderAddress: input.expectedSenderAddress,
      expectedNote: input.expectedNote,
    });

    return decoded.txn;
  }
}
