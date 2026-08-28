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
      <div className="notarize-result">
        <strong>Step 1 — Sign Transaction</strong>

        <p>
          Wallet:{" "}
          {walletReady ? "Connected" : "Not connected"}
        </p>

        <p>
          Transaction:{" "}
          {transactionPrepared
            ? "Prepared"
            : "Not prepared"}
        </p>

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

      <div className="notarize-result">
        <strong>Step 2 — Submit Transaction</strong>

        <p>{submitGuidance}</p>

        {signedTransaction ? (
          <>
            <p>
              Transaction ID:{" "}
              <code>{signedTransaction.txId}</code>
            </p>

            <p>
              Signed Bytes:{" "}
              {signedTransaction.signedTransactionByteLength}
            </p>

            <p>
              Signed At:{" "}
              {signedTransaction.signedAt}
            </p>
          </>
        ) : (
          <p>No signed transaction is available yet.</p>
        )}

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
