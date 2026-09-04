import algosdk from "algosdk";
import type {
  AlgorandSignedProofTransaction,
  NotarizationProof,
} from "../../types";
import { WalletService } from "../wallet/WalletService";
import { AlgorandProofNoteService } from "./AlgorandProofNoteService";
import { AlgorandProofTransactionValidationService } from "./AlgorandProofTransactionValidationService";
import { AlgorandService } from "./AlgorandService";
import { AlgorandTransactionPolicyService } from "./AlgorandTransactionPolicyService";

const PROOF_TRANSACTION_AMOUNT_MICROALGOS = 0;
const DEFAULT_WALLET_APPROVAL_TIMEOUT_MS = 90_000;

export type WalletApprovalOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class WalletApprovalTimeoutError extends Error {
  constructor() {
    super("Wallet approval timed out before a signature was received.");
    this.name = "WalletApprovalTimeoutError";
  }
}

export class WalletApprovalCancelledError extends Error {
  constructor() {
    super("Wallet approval wait was cancelled by the application.");
    this.name = "WalletApprovalCancelledError";
  }
}

function waitForWalletApproval(
  approval: Promise<Uint8Array>,
  options: WalletApprovalOptions
): Promise<Uint8Array> {
  const timeoutMs =
    options.timeoutMs ?? DEFAULT_WALLET_APPROVAL_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    let settled = false;

    const handleAbort = () => {
      finish(() => reject(new WalletApprovalCancelledError()));
    };

    const timeoutId = setTimeout(() => {
      finish(() => reject(new WalletApprovalTimeoutError()));
    }, timeoutMs);

    function finish(callback: () => void) {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", handleAbort);
      callback();
    }

    if (options.signal?.aborted) {
      handleAbort();
      return;
    }

    options.signal?.addEventListener("abort", handleAbort, {
      once: true,
    });

    approval.then(
      (signedTransaction) => {
        finish(() => resolve(signedTransaction));
      },
      (error: unknown) => {
        finish(() => reject(error));
      }
    );
  });
}

export class AlgorandTransactionSigningService {
  static async signProofTransaction(
    proof: NotarizationProof,
    senderAddress: string,
    options: WalletApprovalOptions = {}
  ): Promise<AlgorandSignedProofTransaction> {
    const client = AlgorandService.createAlgodClient();
    const suggestedParams = await client.getTransactionParams().do();

    const note = AlgorandProofNoteService.createNote(proof);

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: senderAddress,
      amount: PROOF_TRANSACTION_AMOUNT_MICROALGOS,
      note,
      suggestedParams,
    });

    AlgorandTransactionPolicyService.assertValid({
      transaction,
      expectedSenderAddress: senderAddress,
      expectedNote: note,
    });

    if (options.signal?.aborted) {
      throw new WalletApprovalCancelledError();
    }

    const signedTransaction = await waitForWalletApproval(
      WalletService.signSingleTransaction(transaction),
      options
    );

    AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
      signedTransaction,
      expectedTransactionId: transaction.txID(),
      expectedSenderAddress: senderAddress,
      expectedNote: note,
    });

    return {
      txId: transaction.txID(),
      signedTransaction,
      signedTransactionByteLength: signedTransaction.byteLength,
      signedAt: new Date().toISOString(),
    };
  }
}


