import type {
  AlgorandConfirmationResult,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
} from "../../../types";

type SignSubmitStepProps = {
  hasDocument: boolean;
  walletReady: boolean;
  transactionPrepared: boolean;
  processing: boolean;
  readyForSignature: boolean;
  signingMessage: string;
  submissionMessage: string;
  confirmationMessage: string;
  signedTransaction: AlgorandSignedProofTransaction | null;
  submissionResult: AlgorandSubmissionResult | null;
  confirmationResult: AlgorandConfirmationResult | null;
  onSignTransaction: () => void;
  onSubmitTransaction: () => void;
};

function SignSubmitStep({
  hasDocument,
  walletReady,
  transactionPrepared,
  processing,
  readyForSignature,
  signingMessage,
  submissionMessage,
  confirmationMessage,
  signedTransaction,
  submissionResult,
  confirmationResult,
  onSignTransaction,
  onSubmitTransaction,
}: SignSubmitStepProps) {
  let signGuidance =
    "Choose a document before requesting a wallet signature.";

  if (hasDocument && !walletReady) {
    signGuidance =
      "Connect Pera Wallet before requesting a signature.";
  } else if (
    hasDocument &&
    walletReady &&
    !transactionPrepared
  ) {
    signGuidance =
      "The wallet is connected, but the transaction is not prepared yet.";
  } else if (readyForSignature) {
    signGuidance =
      "The transaction is ready. Review it carefully in Pera Wallet before approving.";
  } else if (processing && !signedTransaction) {
    signGuidance =
      "Waiting for the wallet operation to complete.";
  }

  const signDisabled =
    !readyForSignature || processing;

  const submitDisabled =
    !signedTransaction ||
    Boolean(submissionResult) ||
    processing;

  const signStepState =
    processing && !signedTransaction
      ? "processing"
      : readyForSignature
        ? "ready"
        : "inactive";

  const submitStepState =
    processing && signedTransaction && !submissionResult
      ? "processing"
      : signedTransaction && !submissionResult
        ? "ready"
        : "inactive";

  let submitGuidance =
    "Sign the transaction before it can be submitted.";

  if (signedTransaction && !submissionResult && !processing) {
    submitGuidance =
      "The transaction is signed but still local. Submitting it will send it to Algorand TestNet.";
  } else if (
    signedTransaction &&
    processing &&
    !submissionResult
  ) {
    submitGuidance =
      "Submission or confirmation is currently in progress.";
  } else if (submissionResult) {
    submitGuidance =
      "This transaction has already been submitted. Another submission is not allowed from this action.";
  }

  return (
    <>
      <div
        className={`notarize-result notarize-action-step ${signStepState}`}
      >
        <strong>Step 1 — Sign Transaction</strong>

        <div className="notarize-action-meta">
          <span className={walletReady ? "complete" : "pending"}>
            Wallet {walletReady ? "connected" : "not connected"}
          </span>
          <span className={transactionPrepared ? "complete" : "pending"}>
            Transaction {transactionPrepared ? "prepared" : "not prepared"}
          </span>
        </div>

        <p>{signGuidance}</p>

        {signingMessage && (
          <p role="status">
            <strong>Signing Status:</strong>{" "}
            {signingMessage}
          </p>
        )}

        <button
          type="button"
          onClick={onSignTransaction}
          disabled={signDisabled}
        >
          {processing && !signedTransaction
            ? "Waiting for Pera Wallet..."
            : signedTransaction
              ? "Transaction Signed"
              : "Sign with Pera Wallet"}
        </button>
      </div>

      <div
        className={`notarize-result notarize-action-step ${submitStepState}`}
      >
        <strong>Step 2 — Submit Transaction</strong>

        <p>{submitGuidance}</p>

        {signedTransaction ? (
          <div className="notarize-signed-summary">
            <span>Signed transaction ready</span>
            <span>{signedTransaction.signedTransactionByteLength} bytes</span>
          </div>
        ) : null}

        {submissionMessage && (
          <p role="status">
            <strong>Submission Status:</strong>{" "}
            {submissionMessage}
          </p>
        )}

        <button
          type="button"
          onClick={onSubmitTransaction}
          disabled={submitDisabled}
        >
          {processing && signedTransaction && !submissionResult
            ? "Processing Algorand Transaction..."
            : submissionResult
              ? "Transaction Submitted"
              : "Submit to Algorand TestNet"}
        </button>
      </div>

      {submissionResult && (
        <div className="notarize-result" role="status">
          <strong>Algorand Submission</strong>

          <p>
            Transaction ID:{" "}
            <code>{submissionResult.transactionId}</code>
          </p>

          <p>
            Submitted At:{" "}
            {submissionResult.submittedAt}
          </p>

          <p>
            {confirmationResult
              ? "Status: Confirmed."
              : "Status: Submitted. Waiting for confirmation."}
          </p>
        </div>
      )}

      {confirmationMessage && (
        <div className="notarize-result" role="status">
          <strong>Confirmation Status</strong>

          <p>{confirmationMessage}</p>

          {confirmationResult && (
            <>
              <p>
                Confirmed Round:{" "}
                {confirmationResult.confirmedRound}
              </p>

              <p>
                Confirmed At:{" "}
                {confirmationResult.confirmedAt}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default SignSubmitStep;
