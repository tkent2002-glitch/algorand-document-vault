import { useState } from "react";
import { DocumentValidationService, HashService } from "../../services";
import "./NotarizePage.css";

function NotarizePage() {
  const [fileName, setFileName] = useState<string>("");
  const [fileHash, setFileHash] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    const result = DocumentValidationService.validate(file);

    setErrors(result.errors);
    setFileHash("");
    setFileName(file?.name ?? "");

    if (!result.valid || !file) {
      return;
    }

    const hash = await HashService.sha256FromFile(file);
    setFileHash(hash);
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
      </div>
    </section>
  );
}

export default NotarizePage;
