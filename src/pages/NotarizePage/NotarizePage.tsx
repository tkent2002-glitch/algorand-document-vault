import { useEffect, useState } from "react";
import { NotarizationWorkflow } from "../../core";
import { WalletService } from "../../services";
import type { NotarizationProof } from "../../types";
import type { WalletConnection } from "../../types/wallet";
import "./NotarizePage.css";

function NotarizePage() {
  const [fileName, setFileName] = useState<string>("");
  const [fileHash, setFileHash] = useState<string>("");
  const [proof, setProof] = useState<NotarizationProof | null>(null);
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
  }

  const walletReady = wallet.status === "connected";

  return (
    <section className="page">
      <h2>Notarize Document</h2>
      <p>Upload a document and preview the proof payload.</p>

      <div className="notarize-panel">
        <div className="notarize-result">
          <strong>Wallet Readiness:</strong>
          <p>{walletReady ? "Pera Wallet connected." : "Pera Wallet not connected."}</p>

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

        {proof && (
          <div className="notarize-result">
            <strong>Proof Status:</strong>
            <p>{proof.status}</p>
            <strong>Proof Created:</strong>
            <p>{proof.createdAt}</p>
          </div>
        )}

        {serializedProofPayload && (
          <div className="notarize-result">
            <strong>Blockchain Proof Payload Preview:</strong>
            <pre>
              <code>{serializedProofPayload}</code>
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}

export default NotarizePage;
