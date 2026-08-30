import { useState } from "react";
import { EvidenceRepository } from "../../repositories";
import {
  BackupEncryptionService,
  BackupIntegrityValidationService,
  EvidenceBackupImportPreviewService,
  EvidenceBackupImportService,
  EvidenceBackupValidationService,
  type EvidenceBackupFile,
  type EvidenceBackupImportPreview,
  type EvidenceBackupImportResult,
  type EvidenceBackupValidationResult,
  type EncryptedEvidenceBackupFile,
  type IntegrityProtectedEvidenceBackupFile,
} from "../../services";
import "./VaultImportPreview.css";

type VaultImportPreviewProps = {
  onImportComplete: () => void;
};

function isEncryptedBackup(
  value: unknown
): value is EncryptedEvidenceBackupFile {
  return Boolean(
    value &&
      typeof value === "object" &&
      "schema" in value &&
      value.schema === "adv-encrypted-evidence-backup-v1"
  );
}

function VaultImportPreview({
  onImportComplete,
}: VaultImportPreviewProps) {
  const [fileName, setFileName] = useState<string>("");
  const [backup, setBackup] =
    useState<EvidenceBackupFile | null>(null);
  const [encryptedBackup, setEncryptedBackup] =
    useState<EncryptedEvidenceBackupFile | null>(null);
  const [decryptionPassword, setDecryptionPassword] =
    useState<string>("");
  const [decrypting, setDecrypting] =
    useState<boolean>(false);
  const [decryptionError, setDecryptionError] =
    useState<string>("");
  const [validation, setValidation] =
    useState<EvidenceBackupValidationResult | null>(null);
  const [preview, setPreview] =
    useState<EvidenceBackupImportPreview | null>(null);
  const [importResult, setImportResult] =
    useState<EvidenceBackupImportResult | null>(null);

  async function prepareBackupPreview(
    candidate: unknown
  ) {
    const structureValidation =
      EvidenceBackupValidationService.validate(candidate);

    if (!structureValidation.valid) {
      setValidation(structureValidation);
      setBackup(null);
      setPreview(null);
      return;
    }

    const integrityValidation =
      await BackupIntegrityValidationService.evaluate(
        candidate as IntegrityProtectedEvidenceBackupFile
      );

    const result: EvidenceBackupValidationResult = {
      valid: integrityValidation.valid,
      errors: integrityValidation.errors,
    };

    setValidation(result);

    if (!result.valid) {
      setBackup(null);
      setPreview(null);
      return;
    }

    const currentRecords = await EvidenceRepository.listAsync();
    const validBackup =
      candidate as IntegrityProtectedEvidenceBackupFile;
    const changePreview =
      EvidenceBackupImportPreviewService.preview(
        validBackup,
        currentRecords
      );

    setBackup(validBackup);
    setPreview(changePreview);
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    setBackup(null);
    setEncryptedBackup(null);
    setDecryptionPassword("");
    setDecryptionError("");
    setValidation(null);
    setPreview(null);
    setImportResult(null);

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (isEncryptedBackup(parsed)) {
        setEncryptedBackup(parsed);
        return;
      }

      await prepareBackupPreview(parsed);
    } catch {
      setValidation({
        valid: false,
        errors: ["Backup file must be valid JSON."],
      });
    }
  }

  async function handleDecrypt() {
    if (!encryptedBackup || !decryptionPassword) {
      return;
    }

    setDecrypting(true);
    setDecryptionError("");
    setValidation(null);
    setBackup(null);
    setPreview(null);
    setImportResult(null);

    try {
      const decrypted =
        await BackupEncryptionService.decrypt<unknown>(
          encryptedBackup,
          decryptionPassword
        );

      await prepareBackupPreview(decrypted);
    } catch (error) {
      setDecryptionError(
        error instanceof Error
          ? error.message
          : "Encrypted backup recovery failed."
      );
    } finally {
      setDecryptionPassword("");
      setDecrypting(false);
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
          <h3>Restore evidence records</h3>
          <p>
            Choose a backup to validate and preview before importing.
          </p>
        </div>
      </div>

      <div className="vault-import-safety">
        <p>
          Nothing is imported until validation passes and you approve
          the preview. Conflicting record IDs are blocked automatically.
        </p>
      </div>

      <div className="vault-import-file-picker">
        <strong>Evidence Vault backup file</strong>
        <div className="vault-import-file-control">
          <label
            className="vault-import-file-button"
            htmlFor="vault-backup-file"
          >
            Select backup file
          </label>
          <span role="status">
            {fileName || "No file selected"}
          </span>
        </div>
        <input
          id="vault-backup-file"
          className="visually-hidden"
          type="file"
          accept="application/json"
          aria-label="Evidence Vault backup file"
          onChange={handleFileChange}
        />
      </div>

      {encryptedBackup && !backup && (
        <div className="vault-import-decryption">
          <div role="status" className="vault-import-status valid">
            <strong>Encrypted Backup Selected</strong>
            <span>
              Enter the backup password to decrypt, validate, and preview
              the records before import.
            </span>
          </div>

          <label htmlFor="vault-backup-password">
            Backup Password
          </label>
          <input
            id="vault-backup-password"
            type="password"
            value={decryptionPassword}
            autoComplete="current-password"
            onChange={(event) =>
              setDecryptionPassword(event.target.value)
            }
          />
          <button
            type="button"
            onClick={handleDecrypt}
            disabled={!decryptionPassword || decrypting}
          >
            {decrypting
              ? "Decrypting Backup..."
              : "Decrypt and Preview"}
          </button>

          {decryptionError && (
            <p className="vault-import-errors" role="alert">
              {decryptionError}
            </p>
          )}
        </div>
      )}

      {validation && (
        <div className="vault-import-result">
          <div
            role="status"
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
                ? "Structure, required metadata, and integrity accepted."
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
        Only import backup files you trust.
      </p>
    </section>
  );
}

export default VaultImportPreview;
