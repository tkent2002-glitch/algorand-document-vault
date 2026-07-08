import { useState } from "react";
import {
  EvidenceBackupValidationService,
  type EvidenceBackupFile,
  type EvidenceBackupValidationResult,
} from "../../services";
import "./VaultImportPreview.css";

function VaultImportPreview() {
  const [fileName, setFileName] = useState<string>("");
  const [backup, setBackup] = useState<EvidenceBackupFile | null>(null);
  const [validation, setValidation] =
    useState<EvidenceBackupValidationResult | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    setBackup(null);
    setValidation(null);

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = EvidenceBackupValidationService.validate(parsed);

      setValidation(result);

      if (result.valid) {
        setBackup(parsed as EvidenceBackupFile);
      }
    } catch {
      setValidation({
        valid: false,
        errors: ["Backup file must be valid JSON."],
      });
    }
  }

  return (
    <div className="vault-import-preview">
      <strong>Backup Import Preview</strong>
      <p>Select an Evidence Vault backup file to validate before importing.</p>

      <input type="file" accept="application/json" onChange={handleFileChange} />

      {fileName && <p>Selected Backup: {fileName}</p>}

      {validation && (
        <div className="vault-import-result">
          <strong>{validation.valid ? "Backup Valid" : "Backup Invalid"}</strong>

          {backup && (
            <>
              <p>Schema: {backup.schema}</p>
              <p>Exported At: {backup.exportedAt}</p>
              <p>Records: {backup.recordCount}</p>
            </>
          )}

          {validation.errors.length > 0 && (
            <ul>
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default VaultImportPreview;
