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
  actionBlocked: boolean;
  onApproveAndNotarize: () => void;
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
  actionBlocked,
  onApproveAndNotarize,
}: SignSubmitStepProps) {
  const walletApproved = Boolean(signedTransaction);
  const submitted = Boolean(submissionResult);
  const confirmed = Boolean(confirmationResult);
  const submissionComplete =
    submitted || (processing && Boolean(confirmationMessage));
  const canResume = walletApproved && !submitted;
  const actionDisabled =
    actionBlocked ||
    processing ||
    submitted ||
    confirmed ||
    (!readyForSignature && !canResume);

  let guidance =
    "Choose a document before starting notarization.";

  if (hasDocument && !walletReady) {
    guidance = "Connect Pera Wallet before starting notarization.";
  } else if (hasDocument && walletReady && !transactionPrepared) {
    guidance =
      "The wallet is connected, but the transaction is not prepared yet.";
  } else if (actionBlocked) {
    guidance =
      "Review the existing transaction status before attempting another submission.";
  } else if (processing && !walletApproved) {
    guidance = "Approve the transaction in Pera Wallet to continue.";
  } else if (processing && walletApproved) {
    guidance =
      "Wallet approval is complete. The app is submitting and confirming the transaction.";
  } else if (submitted && !confirmed) {
    guidance =
      "The transaction is submitted. Wait for confirmation before taking another action.";
  } else if (canResume) {
    guidance =
      "Wallet approval is complete. Resume the interrupted TestNet submission without signing again.";
  } else if (readyForSignature) {
    guidance =
      "Pera will ask for approval once. The app will then submit to Algorand TestNet and wait for confirmation automatically.";
  }

  const actionState = processing
    ? "processing"
    : !submitted && (readyForSignature || canResume)
      ? "ready"
      : "inactive";

  let buttonLabel = "Approve and notarize";

  if (processing && !walletApproved) {
    buttonLabel = "Waiting for Pera Wallet...";
  } else if (processing && walletApproved) {
    buttonLabel = "Submitting and confirming...";
  } else if (canResume) {
    buttonLabel = "Resume notarization";
  } else if (submitted && !confirmed) {
    buttonLabel = "Waiting for confirmation";
  } else if (confirmed) {
    buttonLabel = "Notarization complete";
  }

  const progressStages = [
    {
      label: "Wallet approval",
      complete: walletApproved,
      active: processing && !walletApproved,
    },
    {
      label: "TestNet submission",
      complete: submissionComplete,
      active: processing && walletApproved && !submissionComplete,
    },
    {
      label: "Confirmation",
      complete: confirmed,
      active: processing && submissionComplete && !confirmed,
    },
  ];

  return (
    <div
      className={`notarize-result notarize-action-step ${actionState}`}
    >
      <div className="notarize-action-heading">
        <div>
          <span className="notarize-action-kicker">One secure action</span>
          <strong>Approve and notarize</strong>
        </div>
        <span className="notarize-action-network">Algorand TestNet</span>
      </div>

      <div className="notarize-action-meta">
        <span className={walletReady ? "complete" : "pending"}>
          Wallet {walletReady ? "connected" : "not connected"}
        </span>
        <span className={transactionPrepared ? "complete" : "pending"}>
          Transaction {transactionPrepared ? "prepared" : "not prepared"}
        </span>
      </div>

      <p>{guidance}</p>

      <ol className="notarize-action-progress" aria-label="Notarization progress">
        {progressStages.map((stage, index) => (
          <li
            key={stage.label}
            className={
              stage.complete
                ? "complete"
                : stage.active
                  ? "active"
                  : "pending"
            }
          >
            <span aria-hidden="true">
              {stage.complete ? "✓" : index + 1}
            </span>
            <small>{stage.label}</small>
          </li>
        ))}
      </ol>

      <div className="notarize-action-status" aria-live="polite">
        {signingMessage && (
          <p>
            <strong>Wallet:</strong> {signingMessage}
          </p>
        )}

        {submissionMessage && (
          <p>
            <strong>Network:</strong> {submissionMessage}
          </p>
        )}

        {confirmationMessage && (
          <p>
            <strong>Confirmation:</strong> {confirmationMessage}
          </p>
        )}
      </div>

      {signedTransaction && !submissionResult ? (
        <div className="notarize-signed-summary">
          <span>Wallet approved</span>
          <span>{signedTransaction.signedTransactionByteLength} bytes</span>
        </div>
      ) : null}

      <button
        type="button"
        className="notarize-primary-action"
        onClick={onApproveAndNotarize}
        disabled={actionDisabled}
      >
        {buttonLabel}
      </button>

      {submissionResult && (
        <div className="notarize-submission-receipt" role="status">
          <strong>Transaction submitted</strong>
          <code>{submissionResult.transactionId}</code>
        </div>
      )}
    </div>
  );
}

export default SignSubmitStep;
