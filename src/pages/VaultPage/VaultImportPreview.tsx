import { useState } from "react";
import {
  EvidenceBackupImportPreviewService,
  EvidenceBackupValidationService,
  EvidenceRecordStoreService,
  type EvidenceBackupFile,
  type EvidenceBackupImportPreview,
  type EvidenceBackupValidationResult,
} from "../../services";
import "./VaultImportPreview.css";

function VaultImportPreview() {
  const [fileName, setFileName] = useState<string>("");
  const [backup, setBackup] = useState<EvidenceBackupFile | null>(null);
  const [validation, setValidation] =
    useState<EvidenceBackupValidationResult | null>(null);
  const [preview, setPreview] =
    useState<EvidenceBackupImportPreview | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    setBackup(null);
    setValidation(null);
    setPreview(null);

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = EvidenceBackupValidationService.validate(parsed);

      setValidation(result);

      if (result.valid) {
        const validBackup = parsed as EvidenceBackupFile;
        const currentRecords = EvidenceRecordStoreService.list();
        const changePreview = EvidenceBackupImportPreviewService.preview(
          validBackup,
          currentRecords
        );

        setBackup(validBackup);
        setPreview(changePreview);
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

          {preview && (
            <div className="vault-import-change-preview">
              <strong>Import Change Preview</strong>
              <p>Total Records: {preview.totalRecords}</p>
              <p>New Records: {preview.newRecords}</p>
              <p>Existing Records: {preview.existingRecords}</p>
              <p>Duplicate Fingerprints: {preview.duplicateFingerprints}</p>
              <p>Conflicting Record IDs: {preview.conflictingRecordIds}</p>
            </div>
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
