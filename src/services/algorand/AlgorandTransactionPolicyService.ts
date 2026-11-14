import type { Transaction } from "algosdk";

const ALGORAND_TESTNET_GENESIS_ID = "testnet-v1.0";
const ADV_PROOF_TRANSACTION_FEE_MICROALGOS = 1000n;

export type AlgorandTransactionPolicyInput = {
  transaction: Transaction;
  expectedSenderAddress: string;
  expectedNote: Uint8Array;
};

export type AlgorandTransactionPolicyResult = {
  valid: boolean;
  errors: string[];
};

function byteArraysEqual(
  left: Uint8Array,
  right: Uint8Array
): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }

  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

export class AlgorandTransactionPolicyService {
  static validate(
    input: AlgorandTransactionPolicyInput
  ): AlgorandTransactionPolicyResult {
    const {
      transaction,
      expectedSenderAddress,
      expectedNote,
    } = input;

    const errors: string[] = [];

    if (!transaction.payment) {
      errors.push(
        "Transaction must be an Algorand payment transaction."
      );

      return {
        valid: false,
        errors,
      };
    }

    const senderAddress = transaction.sender.toString();
    const receiverAddress =
      transaction.payment.receiver.toString();

    if (senderAddress !== expectedSenderAddress) {
      errors.push(
        "Transaction sender does not match the expected ADv sender."
      );
    }

    if (receiverAddress !== senderAddress) {
      errors.push(
        "ADv proof transaction receiver must equal the sender."
      );
    }

    if (transaction.payment.amount !== 0n) {
      errors.push(
        "ADv proof transaction must transfer zero microAlgos."
      );
    }

    if (transaction.payment.closeRemainderTo) {
      errors.push(
        "ADv proof transaction must not close the sender account balance."
      );
    }

    if (transaction.rekeyTo) {
      errors.push(
        "ADv proof transaction must not rekey the sender account."
      );
    }

    if (transaction.group) {
      errors.push(
        "ADv proof transaction must not belong to a transaction group."
      );
    }

    if (transaction.lease) {
      errors.push(
        "ADv proof transaction must not contain a transaction lease."
      );
    }

    if (!byteArraysEqual(transaction.note, expectedNote)) {
      errors.push(
        "Transaction note does not match the canonical ADv proof payload."
      );
    }

    if (transaction.genesisID !== ALGORAND_TESTNET_GENESIS_ID) {
      errors.push(
        "Transaction is not configured for the approved Algorand TestNet genesis."
      );
    }

    if (
      transaction.fee !==
      ADV_PROOF_TRANSACTION_FEE_MICROALGOS
    ) {
      errors.push(
        "Transaction fee does not match the approved ADv proof transaction fee."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static assertValid(
    input: AlgorandTransactionPolicyInput
  ): void {
    const result = this.validate(input);

    if (!result.valid) {
      throw new Error(
        `Algorand transaction rejected by ADv policy: ${result.errors.join(
          " "
        )}`
      );
    }
  }
}
