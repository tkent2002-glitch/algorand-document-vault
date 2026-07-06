import { useEffect, useState } from "react";
import { NotarizationWorkflow } from "../../core";
import {
  AlgorandProofTransactionDraftService,
  AlgorandTransactionSigningService,
  WalletService,
} from "../../services";
import type {
  AlgorandProofTransactionDraft,
  AlgorandSignedProofTransaction,
  NotarizationProof,
} from "../../types";
import type { EvidenceRecord } from "../../services";
import type { WalletConnection } from "../../types/wallet";
import BlockchainPreparationStep from "./components/BlockchainPreparationStep";
import DocumentSummaryStep from "./components/DocumentSummaryStep";
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
  const [evidenceRecord, setEvidenceRecord] = useState<EvidenceRecord | null>(
    null
  );
  const [transactionDraft, setTransactionDraft] =
    useState<AlgorandProofTransactionDraft | null>(null);
  const [signedTransaction, setSignedTransaction] =
    useState<AlgorandSignedProofTransaction | null>(null);
  const [serializedProofPayload, setSerializedProofPayload] =
    useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [signingMessage, setSigningMessage] = useState<string>("");
  const [wallet, setWallet] = useState<WalletConnection>({
    status: "disconnected",
  });

  useEffect(() => {
    WalletService.reconnect().then(setWallet);
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const result = await NotarizationWorkflow.execute(file);

    setFileName(result.fileName);
    setFileHash(result.hashValue);
    setProof(result.proof);
    setEvidenceRecord(result.evidenceRecord);
    setSerializedProofPayload(result.serializedProofPayload);
    setErrors(result.errors);
    setSignedTransaction(null);
    setSigningMessage("");

    if (result.proof && wallet.address) {
      const draft = AlgorandProofTransactionDraftService.createDraft(
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
      setSigningMessage("Proof and connected wallet are required before signing.");
      return;
    }

    try {
      setSigningMessage("Opening Pera Wallet for signature approval...");

      const signed = await AlgorandTransactionSigningService.signProofTransaction(
        proof,
        wallet.address
      );

      setSignedTransaction(signed);
      setSigningMessage(
        "Transaction signed successfully. It has not been submitted to Algorand yet."
      );
    } catch (error) {
      console.error("Transaction signing failed:", error);
      setSigningMessage("Transaction signing failed or was rejected.");
    }
  }

  const walletReady = wallet.status === "connected";
  const readyForSignature = Boolean(walletReady && proof && transactionDraft);

  const prettyPayload = serializedProofPayload
    ? JSON.stringify(JSON.parse(serializedProofPayload), null, 2)
    : "";

  return (
    <section className="page">
      <h2>Notarize Document</h2>
      <p>
        Upload a document, inspect its proof, then prepare for Algorand
        notarization.
      </p>

      <div className="notarize-panel">
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

        <div className="notarize-result">
          <strong>Wallet Status</strong>
          <p>{walletReady ? "Pera Wallet connected." : "No Pera Wallet connected."}</p>

          {!walletReady && (
            <p>
              To continue, install or open Pera Wallet, connect it on the Wallet
              page, then return here.
            </p>
          )}

          {wallet.address && (
            <p>
              <strong>Wallet Address:</strong> {wallet.address}
            </p>
          )}
        </div>

        <UploadStep onFileChange={handleFileChange} />

        <DocumentSummaryStep
          fileName={fileName}
          fileHash={fileHash}
          errors={errors}
        />

        <EvidenceRecordPreview evidenceRecord={evidenceRecord} />

        <EvidenceReviewStep prettyPayload={prettyPayload} />

        <BlockchainPreparationStep transactionDraft={transactionDraft} />

        <SignSubmitStep
          readyForSignature={readyForSignature}
          signingMessage={signingMessage}
          signedTransaction={signedTransaction}
          onSignTransaction={handleSignTransaction}
        />
      </div>
    </section>
  );
}

export default NotarizePage;
