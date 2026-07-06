import { useEffect, useState } from "react";
import { NotarizationWorkflow } from "../../core";
import {
  AlgorandProofTransactionDraftService,
  WalletService,
} from "../../services";
import type {
  AlgorandProofTransactionDraft,
  NotarizationProof,
} from "../../types";
import type { WalletConnection } from "../../types/wallet";
import "./NotarizePage.css";

function NotarizePage() {
  const [fileName, setFileName] = useState<string>("");
  const [fileHash, setFileHash] = useState<string>("");
  const [proof, setProof] = useState<NotarizationProof | null>(null);
  const [transactionDraft, setTransactionDraft] =
    useState<AlgorandProofTransactionDraft | null>(null);
  const [serializedProofPayload, setSerializedProofPayload] =
    useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
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
    setSerializedProofPayload(result.serializedProofPayload);
    setErrors(result.errors);

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

  const walletReady = wallet.status === "connected";
  const readyForSignature = Boolean(walletReady && proof && transactionDraft);

  const prettyPayload = serializedProofPayload
    ? JSON.stringify(JSON.parse(serializedProofPayload), null, 2)
    : "";

  return (
    <section className="page">
      <h2>Notarize Document</h2>
      <p>Upload a document, inspect its proof, then prepare for Algorand notarization.</p>

      <div className="notarize-panel">
        <div className="notarize-result">
          <strong>Notarization Progress</strong>
          <p>{fileName ? "? Document selected" : "? Document selected"}</p>
          <p>{fileHash ? "? SHA-256 hash generated" : "? SHA-256 hash generated"}</p>
          <p>{proof ? "? Proof created" : "? Proof created"}</p>
          <p>{serializedProofPayload ? "? Payload prepared" : "? Payload prepared"}</p>
          <p>{walletReady ? "? Wallet connected" : "? Wallet connected"}</p>
          <p>{transactionDraft ? "? Transaction draft prepared" : "? Transaction draft prepared"}</p>
          <p>{readyForSignature ? "? Ready for signature" : "? Ready for signature"}</p>
        </div>

        <div className="notarize-result">
          <strong>Wallet Status</strong>
          <p>{walletReady ? "Pera Wallet connected." : "No Pera Wallet connected."}</p>

          {!walletReady && (
            <p>
              To continue, install or open Pera Wallet, connect it on the Wallet page,
              then return here.
            </p>
          )}

          {wallet.address && (
            <p>
              <strong>Wallet Address:</strong> {wallet.address}
            </p>
          )}
        </div>

        <input type="file" onChange={handleFileChange} />

        {errors.length > 0 && (
          <div className="notarize-errors">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        {fileName && (
          <div className="notarize-result">
            <strong>Selected File:</strong>
            <p>{fileName}</p>
          </div>
        )}

        {fileHash && (
          <div className="notarize-result">
            <strong>SHA-256 Hash:</strong>
            <code>{fileHash}</code>
          </div>
        )}

        {prettyPayload && (
          <div className="notarize-result">
            <strong>Blockchain Proof Payload Preview</strong>
            <p>This is the only document proof data prepared for Algorand.</p>
            <pre>
              <code>{prettyPayload}</code>
            </pre>
          </div>
        )}

        {transactionDraft && (
          <div className="notarize-result">
            <strong>Transaction Review</strong>
            <p>Network: TestNet</p>
            <p>Transaction Type: Payment transaction with proof note</p>
            <p>Amount: 0 ALGO</p>
            <p>Estimated Minimum Fee: 0.001 ALGO</p>
            <p>Sender: {transactionDraft.senderAddress}</p>
            <p>Receiver: {transactionDraft.receiverAddress}</p>
            <p>Note Size: {transactionDraft.noteByteLength} bytes</p>
          </div>
        )}

        <div className="notarize-result">
          <strong>Signature Readiness</strong>
          <p>
            {readyForSignature
              ? "Ready for Pera Wallet signature."
              : "Not ready for signature."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default NotarizePage;
