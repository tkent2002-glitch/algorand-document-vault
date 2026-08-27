import { useState } from "react";
import { EvidenceRepository } from "../../repositories";
import {
  EvidenceBackupImportPreviewService,
  EvidenceBackupImportService,
  EvidenceBackupValidationService,
  type EvidenceBackupFile,
  type EvidenceBackupImportPreview,
  type EvidenceBackupImportResult,
  type EvidenceBackupValidationResult,
} from "../../services";
import "./VaultImportPreview.css";

type VaultImportPreviewProps = {
  onImportComplete: () => void;
};

function VaultImportPreview({
  onImportComplete,
}: VaultImportPreviewProps) {
  const [fileName, setFileName] = useState<string>("");
  const [backup, setBackup] =
    useState<EvidenceBackupFile | null>(null);
  const [validation, setValidation] =
    useState<EvidenceBackupValidationResult | null>(null);
  const [preview, setPreview] =
    useState<EvidenceBackupImportPreview | null>(null);
  const [importResult, setImportResult] =
    useState<EvidenceBackupImportResult | null>(null);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    setBackup(null);
    setValidation(null);
    setPreview(null);
    setImportResult(null);

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
        const currentRecords =
          await EvidenceRepository.listAsync();

        const changePreview =
          EvidenceBackupImportPreviewService.preview(
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

  async function handleImport() {
    if (!backup || !validation?.valid || !preview) {
      return;
    }

    if (preview.conflictingRecordIds > 0) {
      setImportResult({
        importedRecords: 0,
        skippedExistingRecords: 0,
        blockedConflictingRecords:
          preview.conflictingRecordIds,
      });
      return;
    }

    const currentRecords =
      await EvidenceRepository.listAsync();

    const result =
      await EvidenceBackupImportService.importNewRecords(
        backup,
        currentRecords
      );

    await EvidenceRepository.saveAllAsync(result.records);

    setImportResult(result);
    onImportComplete();
  }

  const canImport =
    Boolean(backup && validation?.valid && preview) &&
    preview?.conflictingRecordIds === 0;

  return (
    <section className="vault-import-preview">
      <div className="vault-import-header">
        <div>
          <strong>Restore from Backup</strong>
          <p>
            Select an Evidence Vault backup to validate and preview
            before any records are imported.
          </p>
        </div>

        <span>Validation Required</span>
      </div>

      <div className="vault-import-safety">
        <p>
          Backup files are inspected before they can modify the Vault.
        </p>
        <p>
          Conflicting record IDs block import automatically.
        </p>
      </div>

      <input
        type="file"
        accept="application/json"
        onChange={handleFileChange}
      />

      {fileName && (
        <p>
          <strong>Selected Backup:</strong> {fileName}
        </p>
      )}

      {validation && (
        <div className="vault-import-result">
          <div
            className={
              validation.valid
                ? "vault-import-status valid"
                : "vault-import-status invalid"
            }
          >
            <strong>
              {validation.valid
                ? "Backup Validation Passed"
                : "Backup Validation Failed"}
            </strong>

            <span>
              {validation.valid
                ? "Structure and required metadata accepted."
                : "Import is blocked."}
            </span>
          </div>

          {backup && (
            <div className="vault-import-metadata">
              <div>
                <span>Schema</span>
                <strong>{backup.schema}</strong>
              </div>

              <div>
                <span>Exported At</span>
                <strong>{backup.exportedAt}</strong>
              </div>

              <div>
                <span>Records</span>
                <strong>{backup.recordCount}</strong>
              </div>
            </div>
          )}

          {preview && (
            <div className="vault-import-change-preview">
              <strong>Import Change Preview</strong>

              <p>
                Review these changes before allowing the backup to
                modify the Vault.
              </p>

              <div className="vault-import-change-grid">
                <div>
                  <span>Total Records</span>
                  <strong>{preview.totalRecords}</strong>
                </div>

                <div>
                  <span>New Records</span>
                  <strong>{preview.newRecords}</strong>
                </div>

                <div>
                  <span>Existing Records</span>
                  <strong>{preview.existingRecords}</strong>
                </div>

                <div>
                  <span>Duplicate Fingerprints</span>
                  <strong>{preview.duplicateFingerprints}</strong>
                </div>

                <div>
                  <span>Conflicting Record IDs</span>
                  <strong>{preview.conflictingRecordIds}</strong>
                </div>
              </div>

              {preview.conflictingRecordIds > 0 && (
                <p className="vault-import-conflict-warning">
                  Import is blocked because conflicting record IDs
                  were detected.
                </p>
              )}

              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport}
              >
                {canImport
                  ? "Import New Records"
                  : "Import Blocked"}
              </button>
            </div>
          )}

          {importResult && (
            <div className="vault-import-change-preview">
              <strong>Import Result</strong>

              <div className="vault-import-change-grid">
                <div>
                  <span>Imported</span>
                  <strong>{importResult.importedRecords}</strong>
                </div>

                <div>
                  <span>Skipped Existing</span>
                  <strong>
                    {importResult.skippedExistingRecords}
                  </strong>
                </div>

                <div>
                  <span>Blocked Conflicts</span>
                  <strong>
                    {importResult.blockedConflictingRecords}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {validation.errors.length > 0 && (
            <div className="vault-import-errors">
              <strong>Validation Details</strong>

              <ul>
                {validation.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="vault-import-boundary">
        Only import backup files you trust. Validation and conflict
        checks run before records are written to the Vault.
      </p>
    </section>
  );
}

export default VaultImportPreview;