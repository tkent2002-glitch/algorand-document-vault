import { useEffect, useState } from "react";
import { NotarizationWorkflow } from "../../core";
import {
  AlgorandNotarizationLifecycleError,
  AlgorandNotarizationLifecycleService,
} from "../../services/algorand/AlgorandNotarizationLifecycleService";
import {
  AlgorandProofTransactionDraftService,
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
import ProgressTimeline from "./components/ProgressTimeline";
import SignSubmitStep from "./components/SignSubmitStep";
import UploadStep from "./components/UploadStep";
import "./NotarizePage.css";

function NotarizePage() {
  const [fileName, setFileName] = useState<string>("");
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
  const [processing, setProcessing] = useState<boolean>(false);
  const [wallet, setWallet] = useState<WalletConnection>({
    status: "disconnected",
  });

  useEffect(() => {
    let mounted = true;

    WalletService.reconnect().then((result) => {
      if (mounted) {
        setWallet(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    const result = await NotarizationWorkflow.execute(file);

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

  async function handleSignTransaction() {
    if (!proof || !wallet.address) {
      setSigningMessage(
        "Proof and connected wallet are required before signing."
      );
      return;
    }

    try {
      setProcessing(true);
      setSigningMessage(
        "Opening Pera Wallet for signature approval..."
      );

      const signed =
        await AlgorandTransactionSigningService.signProofTransaction(
          proof,
          wallet.address
        );

      setSignedTransaction(signed);
      setSubmissionResult(null);
      setConfirmationResult(null);
      setSigningMessage(
        "Transaction signed successfully. It has not been submitted yet."
      );
      setSubmissionMessage("");
      setConfirmationMessage("");
    } catch (error) {
      console.error("Transaction signing failed:", error);
      setSigningMessage(
        "Transaction signing failed, was rejected, or was cancelled."
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleSubmitTransaction() {
    if (!signedTransaction) {
      setSubmissionMessage(
        "A signed transaction is required before submission."
      );
      return;
    }

    if (!evidenceRecord) {
      setSubmissionMessage(
        "An evidence record is required before submission."
      );
      return;
    }

    try {
      setProcessing(true);
      setSubmissionResult(null);
      setConfirmationResult(null);

      const result =
        await AlgorandNotarizationLifecycleService.complete({
          signedTransaction,
          evidenceRecord,
          onProgress: ({ stage, message }) => {
            if (stage === "submitting" || stage === "submitted") {
              setSubmissionMessage(message);
            }

            if (stage === "confirming" || stage === "confirmed") {
              setConfirmationMessage(message);
            }
          },
        });

      setSubmissionResult(result.submissionResult);
      setConfirmationResult(result.confirmationResult);
      setEvidenceRecord(result.confirmedRecord);
    } catch (error) {
      console.error(
        "End-to-end Algorand notarization failed:",
        error
      );

      if (error instanceof AlgorandNotarizationLifecycleError) {
        if (
          error.stage === "submitting" ||
          error.stage === "submitted"
        ) {
          setSubmissionMessage(
            "Transaction submission failed. The signed transaction was not confirmed."
          );
        } else {
          setConfirmationMessage(
            "Transaction confirmation failed or timed out. Check the transaction status before retrying."
          );
        }
      } else {
        setConfirmationMessage(
          "Algorand notarization failed unexpectedly."
        );
      }
    } finally {
      setProcessing(false);
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

  return (
    <section className="page notarize-page">
      <div className="notarize-header">
        <h2>Notarize Document</h2>
        <p>
          Create cryptographic evidence for one document and prepare it
          for Algorand TestNet notarization.
        </p>
      </div>

      <div className="notarize-workspace">
        <div className="notarize-row">
          <div className="notarize-section">
            <UploadStep onFileChange={handleFileChange} />
          </div>

          <div className="notarize-section">
            <DocumentSummaryStep
              fileName={fileName}
              fileHash={fileHash}
              errors={errors}
            />

            <DuplicateEvidenceWarning
              duplicateRecord={duplicateRecord}
            />

            <EvidenceRecordPreview
              evidenceRecord={evidenceRecord}
            />
          </div>
        </div>

        <BlockchainPreparationStep
          transactionDraft={transactionDraft}
        />

        <EvidenceReviewStep prettyPayload={prettyPayload} />

        <SignSubmitStep
          readyForSignature={readyForSignature}
          signingMessage={signingMessage}
          submissionMessage={submissionMessage}
          confirmationMessage={confirmationMessage}
          signedTransaction={signedTransaction}
          submissionResult={submissionResult}
          confirmationResult={confirmationResult}
          onSignTransaction={handleSignTransaction}
          onSubmitTransaction={handleSubmitTransaction}
        />

        <ProgressTimeline
          fileName={fileName}
          fileHash={fileHash}
          proof={proof}
          evidenceRecord={evidenceRecord}
          serializedProofPayload={serializedProofPayload}
          walletReady={walletReady}
          transactionDraft={transactionDraft}
          signedTransaction={signedTransaction}
        />
      </div>
    </section>
  );
}

export default NotarizePage;
