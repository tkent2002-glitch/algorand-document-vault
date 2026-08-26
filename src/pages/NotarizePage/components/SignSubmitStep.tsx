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
  let readinessMessage =
    "Choose a document to begin notarization.";

  if (hasDocument && !walletReady) {
    readinessMessage =
      "Document proof is ready. Connect Pera Wallet before signing.";
  } else if (
    hasDocument &&
    walletReady &&
    !transactionPrepared
  ) {
    readinessMessage =
      "Wallet connected. Preparing the Algorand transaction.";
  } else if (readyForSignature) {
    readinessMessage =
      "Everything is ready. Review and approve the transaction in Pera Wallet.";
  } else if (processing) {
    readinessMessage =
      "A blockchain operation is currently in progress.";
  }

  return (
    <>
      <div className="notarize-result">
        <strong>Signature Readiness</strong>

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

        <p>{readinessMessage}</p>

        {signingMessage && <p>{signingMessage}</p>}

        <button
          type="button"
          onClick={onSignTransaction}
          disabled={!readyForSignature || processing}
        >
          {processing && !signedTransaction
            ? "Waiting for Wallet..."
            : "Sign with Pera Wallet"}
        </button>
      </div>

      {signedTransaction && (
        <div className="notarize-result">
          <strong>Submission Readiness</strong>

          <p>Transaction signed successfully.</p>
          <p>
            The transaction has not been submitted until you explicitly
            select the submit action below.
          </p>

          <p>Transaction ID: {signedTransaction.txId}</p>
          <p>
            Signed Bytes:{" "}
            {signedTransaction.signedTransactionByteLength}
          </p>
          <p>Signed At: {signedTransaction.signedAt}</p>

          {submissionMessage && <p>{submissionMessage}</p>}

          <button
            type="button"
            onClick={onSubmitTransaction}
            disabled={Boolean(submissionResult) || processing}
          >
            {processing && !submissionResult
              ? "Submitting..."
              : "Submit to Algorand TestNet"}
          </button>
        </div>
      )}

      {submissionResult && (
        <div className="notarize-result">
          <strong>Submitted to Algorand</strong>
          <p>Transaction ID: {submissionResult.transactionId}</p>
          <p>Submitted At: {submissionResult.submittedAt}</p>

          <p>
            {confirmationResult
              ? "Status: Confirmed."
              : "Status: Submitted. Waiting for confirmation."}
          </p>
        </div>
      )}

      {confirmationMessage && (
        <div className="notarize-result">
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