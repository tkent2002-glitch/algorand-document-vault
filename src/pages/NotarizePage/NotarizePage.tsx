import { useState } from "react";
import type { NotarizationProof } from "../../types";
import {
  DocumentValidationService,
  HashService,
  NotarizationService,
} from "../../services";
import "./NotarizePage.css";

function NotarizePage() {
  const [fileName, setFileName] = useState<string>("");
  const [fileHash, setFileHash] = useState<string>("");
  const [proof, setProof] = useState<NotarizationProof | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const result = DocumentValidationService.validate(file);

    setErrors(result.errors);
    setFileHash("");
    setProof(null);
    setFileName(file?.name ?? "");

    if (!result.valid || !file) {
      return;
    }

    const hashValue = await HashService.sha256FromFile(file);

    const documentHash = {
      algorithm: "SHA-256" as const,
      value: hashValue,
    };

    const notarizationProof = NotarizationService.createProof(documentHash);

    setFileHash(hashValue);
    setProof(notarizationProof);
  }

  return (
    <section className="page">
      <h2>Notarize Document</h2>
      <p>Upload a document and create a SHA-256 fingerprint.</p>

      <div className="notarize-panel">
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
      </div>
    </section>
  );
}

export default NotarizePage;
