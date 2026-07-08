import type {
  AlgorandConfirmationResult,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
} from "../../../types";

type SignSubmitStepProps = {
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
  return (
    <>
      <div className="notarize-result">
        <strong>Signature Readiness</strong>

        <p>
          {readyForSignature
            ? "Ready for Pera Wallet signature."
            : "Not ready for signature."}
        </p>

        {signingMessage && <p>{signingMessage}</p>}

        <button onClick={onSignTransaction} disabled={!readyForSignature}>
          Sign with Pera Wallet
        </button>
      </div>

      {signedTransaction && (
        <div className="notarize-result">
          <strong>Submission Confirmation</strong>
          <p>Transaction signed successfully.</p>
          <p>Transaction ID: {signedTransaction.txId}</p>
          <p>Signed Bytes: {signedTransaction.signedTransactionByteLength}</p>
          <p>Signed At: {signedTransaction.signedAt}</p>

          {submissionMessage && <p>{submissionMessage}</p>}

          <button onClick={onSubmitTransaction} disabled={Boolean(submissionResult)}>
            Submit to Algorand TestNet
          </button>
        </div>
      )}

      {submissionResult && (
        <div className="notarize-result">
          <strong>Submitted to Algorand</strong>
          <p>Transaction ID: {submissionResult.transactionId}</p>
          <p>Submitted At: {submissionResult.submittedAt}</p>
          <p>Status: Submitted. Waiting for confirmation.</p>
        </div>
      )}

      {confirmationMessage && (
        <div className="notarize-result">
          <strong>Confirmation Status</strong>
          <p>{confirmationMessage}</p>

          {confirmationResult && (
            <>
              <p>Confirmed Round: {confirmationResult.confirmedRound}</p>
              <p>Confirmed At: {confirmationResult.confirmedAt}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default SignSubmitStep;
