import { useEffect, useState } from "react";
import { useRef } from "react";
import { Logger, NotarizationWorkflow } from "../../core";
import { EvidenceRepository } from "../../repositories";
import {
  AlgorandNotarizationLifecycleError,
  AlgorandNotarizationLifecycleService,
} from "../../services/algorand/AlgorandNotarizationLifecycleService";
import {
  TransactionFailureClassificationService,
  type TransactionFailureStage,
} from "../../services/algorand/TransactionFailureClassificationService";
import { TransactionRetryPolicyService } from "../../services/algorand/TransactionRetryPolicyService";
import { TransactionRecoveryDecisionService } from "../../services/algorand/TransactionRecoveryDecisionService";
import {
  AlgorandExplorerService,
  AlgorandProofTransactionDraftService,
  AlgorandTestNetPreflightService,
  AlgorandTransactionSigningService,
  WalletService,
} from "../../services";
import type { EvidenceRecord } from "../../services";
import type {
  AlgorandConfirmationResult,
  AlgorandProofTransactionDraft,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
  NotarizationProof,
} from "../../types";
import type { WalletConnection } from "../../types/wallet";
import BlockchainPreparationStep from "./components/BlockchainPreparationStep";
import DocumentSummaryStep from "./components/DocumentSummaryStep";
import DuplicateEvidenceWarning from "./components/DuplicateEvidenceWarning";
import EvidenceRecordPreview from "./components/EvidenceRecordPreview";
import EvidenceReviewStep from "./components/EvidenceReviewStep";
import NotarizationSuccessPanel from "./components/NotarizationSuccessPanel";
import ProgressTimeline from "./components/ProgressTimeline";
import SignSubmitStep from "./components/SignSubmitStep";
import UploadStep from "./components/UploadStep";
import WalletReadinessPanel from "./components/WalletReadinessPanel";
import "./NotarizePage.css";

type NotarizePageProps = {
  onCompletionChange?: (complete: boolean) => void;
};

function NotarizePage({
  onCompletionChange,
}: NotarizePageProps) {
  const [fileName, setFileName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  const [proof, setProof] = useState<NotarizationProof | null>(null);
  const [evidenceRecord, setEvidenceRecord] =
    useState<EvidenceRecord | null>(null);
  const [duplicateRecord, setDuplicateRecord] =
    useState<EvidenceRecord | null>(null);
  const [transactionDraft, setTransactionDraft] =
    useState<AlgorandProofTransactionDraft | null>(null);
  const [signedTransaction, setSignedTransaction] =
    useState<AlgorandSignedProofTransaction | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<AlgorandSubmissionResult | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<AlgorandConfirmationResult | null>(null);
  const [serializedProofPayload, setSerializedProofPayload] =
    useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [signingMessage, setSigningMessage] = useState<string>("");
  const [submissionMessage, setSubmissionMessage] =
    useState<string>("");
  const [confirmationMessage, setConfirmationMessage] =
    useState<string>("");
  const [recoveryMessage, setRecoveryMessage] =
    useState<string>("");
  const [unsafeResubmissionBlocked, setUnsafeResubmissionBlocked] =
    useState<boolean>(false);
  const [recoveryTransactionId, setRecoveryTransactionId] =
    useState<string | null>(null);
  const [checkingTransactionStatus, setCheckingTransactionStatus] =
    useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [walletApprovalPending, setWalletApprovalPending] =
    useState<boolean>(false);
  const [walletConnecting, setWalletConnecting] =
    useState<boolean>(false);
  const [wallet, setWallet] = useState<WalletConnection>({
    status: "disconnected",
  });
  const walletApprovalAbortController =
    useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;

    WalletService.reconnect().then((result) => {
      if (mounted) {
        setWallet(result);
      }
    });

    return () => {
      mounted = false;
      walletApprovalAbortController.current?.abort();
    };
  }, []);

  useEffect(() => {
    onCompletionChange?.(Boolean(confirmationResult));
  }, [confirmationResult, onCompletionChange]);

  async function handleConnectWallet() {
    try {
      setWalletConnecting(true);

      const result = await WalletService.connect();
      setWallet(result);

      if (
        result.status === "connected" &&
        result.address &&
        proof
      ) {
        const draft =
          AlgorandProofTransactionDraftService.createDraft(
            proof,
            result.address
          );

        setTransactionDraft(draft);
      }
    } finally {
      setWalletConnecting(false);
    }
  }

  async function handleDisconnectWallet() {
    try {
      setWalletConnecting(true);

      const result = await WalletService.disconnect();
      setWallet(result);

      if (result.status === "disconnected") {
        setTransactionDraft(null);
      }
    } finally {
      setWalletConnecting(false);
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    const result = await NotarizationWorkflow.execute(file);

    setSelectedFile(file);
    setFileName(result.fileName);
    setFileHash(result.hashValue);
    setProof(result.proof);
    setEvidenceRecord(result.evidenceRecord);
    setDuplicateRecord(result.duplicateRecord);
    setSerializedProofPayload(result.serializedProofPayload);
    setErrors(result.errors);

    setSignedTransaction(null);
    setSubmissionResult(null);
    setConfirmationResult(null);
    setSigningMessage("");
    setSubmissionMessage("");
    setConfirmationMessage("");
    setRecoveryMessage("");
    setUnsafeResubmissionBlocked(false);
    setRecoveryTransactionId(null);

    if (result.proof && wallet.address) {
      const draft =
        AlgorandProofTransactionDraftService.createDraft(
          result.proof,
          wallet.address
        );

      setTransactionDraft(draft);
    } else {
      setTransactionDraft(null);
    }
  }

  async function handleApproveAndNotarize() {
    if (unsafeResubmissionBlocked) {
      setRecoveryMessage(
        "Submission is blocked until the existing transaction status has been reviewed."
      );
      return;
    }

    if (!proof || !wallet.address || !evidenceRecord) {
      setSigningMessage(
        "A prepared proof, evidence record, and connected wallet are required before notarization."
      );
      return;
    }

    let transactionToSubmit = signedTransaction;

    try {
      setProcessing(true);
      setRecoveryMessage("");
      setRecoveryTransactionId(null);

      if (!transactionToSubmit) {
        setSigningMessage(
          "Checking Algorand TestNet readiness..."
        );

        try {
          const preflight =
            await AlgorandTestNetPreflightService.evaluate();

          if (!preflight.ready) {
            const reason =
              preflight.errors.length > 0
                ? preflight.errors.join(" ")
                : "Algorand TestNet readiness checks did not pass.";

            setSigningMessage(
              `Wallet approval blocked. ${reason}`
            );

            return;
          }

          setSigningMessage(
            "Opening Pera Wallet for transaction approval..."
          );

          const approvalController = new AbortController();
          walletApprovalAbortController.current = approvalController;
          setWalletApprovalPending(true);

          try {
            transactionToSubmit =
              await AlgorandTransactionSigningService.signProofTransaction(
                proof,
                wallet.address,
                { signal: approvalController.signal }
              );
          } finally {
            if (
              walletApprovalAbortController.current === approvalController
            ) {
              walletApprovalAbortController.current = null;
            }
            setWalletApprovalPending(false);
          }

          setSignedTransaction(transactionToSubmit);
          setSubmissionResult(null);
          setConfirmationResult(null);
          setUnsafeResubmissionBlocked(false);

          setSigningMessage(
            "Wallet approval complete. Submitting to Algorand TestNet..."
          );

          setSubmissionMessage("");
          setConfirmationMessage("");
        } catch (error) {
          Logger.error("Transaction signing failed.");

          const failure =
            TransactionFailureClassificationService.classify(
              error,
              { stage: "signing" }
            );

          const policy =
            TransactionRetryPolicyService.evaluate(failure);

          setSigningMessage(failure.userMessage);
          setRecoveryMessage(policy.userMessage);

          setUnsafeResubmissionBlocked(
            policy.transactionMayHaveBeenSubmitted &&
              !policy.canRetryImmediately
          );
          return;
        }
      } else {
        setSigningMessage(
          "Wallet approval is already complete. Resuming TestNet submission..."
        );
      }

      setSubmissionResult(null);
      setConfirmationResult(null);

      try {
        const result =
          await AlgorandNotarizationLifecycleService.complete({
            signedTransaction: transactionToSubmit,
            evidenceRecord,
            onProgress: ({ stage, message }) => {
              if (
                stage === "submitting" ||
                stage === "submitted"
              ) {
                setSubmissionMessage(message);
              }

              if (
                stage === "confirming" ||
                stage === "confirmed"
              ) {
                setConfirmationMessage(message);
              }
            },
          });

        setSubmissionResult(result.submissionResult);
        setConfirmationResult(result.confirmationResult);
        setEvidenceRecord(result.confirmedRecord);
        setUnsafeResubmissionBlocked(false);
        setRecoveryMessage("");
      } catch (error) {
        Logger.error("End-to-end Algorand notarization failed.");

        const lifecycleStage =
          error instanceof AlgorandNotarizationLifecycleError
            ? error.stage
            : "unknown";

        const sourceError =
          error instanceof AlgorandNotarizationLifecycleError
            ? error.causeValue
            : error;

        const failedTransactionId =
          error instanceof AlgorandNotarizationLifecycleError
            ? error.transactionId
            : null;

        setRecoveryTransactionId(failedTransactionId);

        let stage: TransactionFailureStage = "unknown";

        if (
          lifecycleStage === "submitting" ||
          lifecycleStage === "submitted"
        ) {
          stage = "submitting";
        } else if (
          lifecycleStage === "confirming" ||
          lifecycleStage === "confirmed"
        ) {
          stage = "confirming";
        }

        const failure =
          TransactionFailureClassificationService.classify(
            sourceError,
            { stage }
          );

        const policy =
          TransactionRetryPolicyService.evaluate(failure);

        if (stage === "submitting") {
          setSubmissionMessage(failure.userMessage);
        } else {
          setConfirmationMessage(failure.userMessage);
        }

        setRecoveryMessage(policy.userMessage);

        setUnsafeResubmissionBlocked(
          policy.transactionMayHaveBeenSubmitted &&
            !policy.canRetryImmediately
        );
      }
    } finally {
      setProcessing(false);
    }
  }

  function handleCancelWalletApproval() {
    if (!walletApprovalAbortController.current) {
      return;
    }

    setSigningMessage("Cancelling the wallet approval wait...");
    walletApprovalAbortController.current.abort();
  }

  async function handleCheckTransactionStatus() {
    if (!recoveryTransactionId) {
      setRecoveryMessage(
        "No transaction ID is available for status verification."
      );
      return;
    }

    try {
      setCheckingTransactionStatus(true);

      const recoveryFailure =
        TransactionFailureClassificationService.classify(
          new Error("Transaction confirmation status is uncertain."),
          { stage: "confirming" }
        );

      const recovery =
        await TransactionRecoveryDecisionService.evaluate({
          failure: recoveryFailure,
          transactionId: recoveryTransactionId,
        });

      setRecoveryMessage(recovery.userMessage);

      if (
        recovery.decision === "confirmed" &&
        recovery.statusResult?.confirmedRound
      ) {
        const confirmedAt = new Date().toISOString();

        setConfirmationResult({
          transactionId: recoveryTransactionId,
          confirmedRound:
            recovery.statusResult.confirmedRound,
          confirmedAt,
        });

        if (evidenceRecord) {
          const recoveredRecord = {
            ...evidenceRecord,
            status: "confirmed" as const,
            algorandTransactionId: recoveryTransactionId,
            confirmedRound:
              recovery.statusResult.confirmedRound,
            confirmedAt,
          };

          await EvidenceRepository.saveAsync(recoveredRecord);
          setEvidenceRecord(recoveredRecord);
        }

        setUnsafeResubmissionBlocked(false);
        setConfirmationMessage(
          "Transaction confirmation recovered successfully."
        );

        return;
      }

      setUnsafeResubmissionBlocked(
        recovery.decision !== "safe_to_retry"
      );
    } catch (error) {
      console.error(
        "Transaction recovery status check failed:",
        error
      );

      setRecoveryMessage(
        "Transaction status could not be verified. Do not resubmit until the transaction state can be confirmed."
      );

      setUnsafeResubmissionBlocked(true);
    } finally {
      setCheckingTransactionStatus(false);
    }
  }

  const walletReady = wallet.status === "connected";

  const readyForSignature = Boolean(
    walletReady &&
      proof &&
      transactionDraft &&
      !processing
  );

  const prettyPayload = serializedProofPayload
    ? JSON.stringify(
        JSON.parse(serializedProofPayload),
        null,
        2
      )
    : "";

  const recoveryExplorerUrl = recoveryTransactionId
    ? AlgorandExplorerService.getTransactionUrl(
        recoveryTransactionId
      )
    : null;

  return (
    <section className="page notarize-page">
      <div className="notarize-header">
        <p className="notarize-eyebrow">TestNet Notarization</p>
        <h2>
          {confirmationResult
            ? "Notarization Receipt"
            : "Notarize Document"}
        </h2>
        <p>
          {confirmationResult
            ? "Your document fingerprint is confirmed on Algorand TestNet. Review the receipt or begin another notarization."
            : "Select one document, review its local proof, and approve the Algorand TestNet transaction only when you are ready."}
        </p>
      </div>

      <div className="notarize-workspace">
        {!confirmationResult && (
          <div className="notarize-primary-grid">
            <div className="notarize-section">
              <UploadStep onFileChange={handleFileChange} />
            </div>

            <WalletReadinessPanel
              wallet={wallet}
              connecting={walletConnecting}
              onConnect={handleConnectWallet}
              onDisconnect={handleDisconnectWallet}
            />
          </div>
        )}

        {recoveryMessage && (
          <div
            className="notarize-recovery-message"
            role="alert"
          >
            <strong>Transaction Recovery Guidance</strong>
            <p>{recoveryMessage}</p>

            {unsafeResubmissionBlocked && (
              <>
                <p>
                  Automatic resubmission is disabled because the previous
                  transaction may already have reached the Algorand network.
                </p>

                {recoveryTransactionId && (
                  <div className="notarize-recovery-actions">
                    <p>
                      Transaction ID:{" "}
                      <code>{recoveryTransactionId}</code>
                    </p>

                    <button
                      type="button"
                      onClick={handleCheckTransactionStatus}
                      disabled={checkingTransactionStatus}
                    >
                      {checkingTransactionStatus
                        ? "Checking Transaction Status..."
                        : "Check Transaction Status"}
                    </button>

                    {recoveryExplorerUrl && (
                      <a
                        href={recoveryExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transaction in Explorer
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!confirmationResult && (
          <div className="notarize-action-grid">
            <SignSubmitStep
              hasDocument={Boolean(proof)}
              walletReady={walletReady}
              transactionPrepared={Boolean(transactionDraft)}
              processing={processing}
              walletApprovalPending={walletApprovalPending}
              readyForSignature={readyForSignature}
              signingMessage={signingMessage}
              submissionMessage={submissionMessage}
              confirmationMessage={confirmationMessage}
              signedTransaction={signedTransaction}
              submissionResult={submissionResult}
              confirmationResult={confirmationResult}
              actionBlocked={unsafeResubmissionBlocked}
              onApproveAndNotarize={handleApproveAndNotarize}
              onCancelWalletApproval={handleCancelWalletApproval}
            />
          </div>
        )}

        {!confirmationResult &&
          (fileName || errors.length > 0 || evidenceRecord) && (
            <div
              className="notarize-document-information"
              aria-label="Selected document information"
            >
              <DocumentSummaryStep
                fileName={fileName}
                fileHash={fileHash}
                errors={errors}
              />

              <EvidenceRecordPreview
                evidenceRecord={evidenceRecord}
              />

              <DuplicateEvidenceWarning
                duplicateRecord={duplicateRecord}
              />
            </div>
          )}

        <NotarizationSuccessPanel
          confirmationResult={confirmationResult}
          evidenceRecord={evidenceRecord}
          originalDocument={selectedFile}
        />

        {confirmationResult && (
          <div className="notarize-completed-next">
            <UploadStep
              onFileChange={handleFileChange}
              title="Notarize another document"
              description="Choose a new document to begin a fresh TestNet notarization. Your confirmed record will remain in the Vault."
            />
          </div>
        )}

        <details
          className="notarize-disclosure"
          open={Boolean(
            !confirmationResult &&
              (transactionDraft ||
              signedTransaction ||
              submissionResult)
          )}
        >
          <summary>
            <span>
              <strong>
                {confirmationResult
                  ? "Completed transaction details"
                  : "Proof and transaction details"}
              </strong>
              <small>
                {confirmationResult
                  ? "Review the proof payload and completed workflow only when needed."
                  : "Review the prepared transaction, proof payload, and workflow progress."}
              </small>
            </span>
            <span className="notarize-disclosure-action">
              View details
            </span>
          </summary>

          <div className="notarize-disclosure-content">
            <BlockchainPreparationStep
              transactionDraft={transactionDraft}
            />

            <EvidenceReviewStep prettyPayload={prettyPayload} />

            <ProgressTimeline
              fileName={fileName}
              fileHash={fileHash}
              proof={proof}
              evidenceRecord={evidenceRecord}
              serializedProofPayload={serializedProofPayload}
              walletReady={walletReady}
              transactionDraft={transactionDraft}
              signedTransaction={signedTransaction}
              submissionResult={submissionResult}
              confirmationResult={confirmationResult}
            />
          </div>
        </details>
      </div>
    </section>
  );
}

export default NotarizePage;

















