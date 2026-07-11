import { useState } from "react";
import { EvidenceRepository } from "../../repositories";
import {
  BackupEncryptionService,
  BackupTrustService,
  EvidenceBackupImportPreviewService,
  EvidenceBackupImportService,
  type BackupTrustResult,
  type EncryptedEvidenceBackupFile,
  type EvidenceBackupImportPreview,
  type EvidenceBackupImportResult,
  type TrustedEvidenceBackupFile,
} from "../../services";
import "./VaultImportPreview.css";

type VaultImportPreviewProps = {
  onImportComplete: () => void;
};

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isEncryptedBackup(
  value: unknown
): value is EncryptedEvidenceBackupFile {
  return (
    isJsonObject(value) &&
    value.schema === "adv-encrypted-evidence-backup-v1"
  );
}

function VaultImportPreview({ onImportComplete }: VaultImportPreviewProps) {
  const [fileName, setFileName] = useState<string>("");
  const [backup, setBackup] =
    useState<TrustedEvidenceBackupFile | null>(null);
  const [encryptedBackup, setEncryptedBackup] =
    useState<EncryptedEvidenceBackupFile | null>(null);
  const [password, setPassword] = useState<string>("");
  const [trustResult, setTrustResult] =
    useState<BackupTrustResult | null>(null);
  const [preview, setPreview] =
    useState<EvidenceBackupImportPreview | null>(null);
  const [importResult, setImportResult] =
    useState<EvidenceBackupImportResult | null>(null);
  const [message, setMessage] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);

  function resetResults(): void {
    setBackup(null);
    setEncryptedBackup(null);
    setPassword("");
    setTrustResult(null);
    setPreview(null);
    setImportResult(null);
    setMessage("");
  }

  function preparePreview(
    trustedBackup: TrustedEvidenceBackupFile
  ): void {
    const currentRecords = EvidenceRepository.list();

    const changePreview = EvidenceBackupImportPreviewService.preview(
      trustedBackup,
      currentRecords
    );

    setBackup(trustedBackup);
    setPreview(changePreview);
  }

  async function evaluatePlainBackup(
    candidate: TrustedEvidenceBackupFile
  ): Promise<void> {
    const result = await BackupTrustService.evaluate(candidate);

    setTrustResult(result);

    if (result.trusted) {
      preparePreview(candidate);
      setMessage("Backup trust verification passed.");
    } else {
      setMessage("Backup trust verification failed. Import is blocked.");
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    resetResults();

    if (!file) {
      return;
    }

    try {
      setProcessing(true);

      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (isEncryptedBackup(parsed)) {
        setEncryptedBackup(parsed);
        setMessage(
          "Encrypted backup detected. Enter its password to decrypt and validate it."
        );
        return;
      }

      if (!isJsonObject(parsed)) {
        setMessage("Backup file must contain a JSON object.");
        return;
      }

      await evaluatePlainBackup(
        parsed as unknown as TrustedEvidenceBackupFile
      );
    } catch {
      setMessage("Backup file must contain valid JSON.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDecryptAndValidate() {
    if (!encryptedBackup || !password) {
      setMessage("Enter the encrypted backup password.");
      return;
    }

    try {
      setProcessing(true);
      setBackup(null);
      setTrustResult(null);
      setPreview(null);
      setImportResult(null);
      setMessage("Decrypting backup in memory...");

      const decryptedBackup =
        await BackupEncryptionService.decrypt<TrustedEvidenceBackupFile>(
          encryptedBackup,
          password
        );

      const result = await BackupTrustService.evaluate(decryptedBackup);

      setTrustResult(result);

      if (!result.trusted) {
        setMessage(
          "The backup was decrypted, but trust verification failed. Import is blocked."
        );
        return;
      }

      preparePreview(decryptedBackup);
      setMessage(
        "Encrypted backup decrypted and trust verification passed."
      );
    } catch (error) {
      console.error("Encrypted backup decryption failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Encrypted backup decryption failed."
      );
    } finally {
      setPassword("");
      setProcessing(false);
    }
  }

  async function handleImport() {
    if (!backup || !trustResult?.trusted || !preview) {
      setMessage("A trusted backup is required before importing.");
      return;
    }

    if (preview.conflictingRecordIds > 0) {
      setImportResult({
        importedRecords: 0,
        skippedExistingRecords: 0,
        blockedConflictingRecords: preview.conflictingRecordIds,
      });

      setMessage("Import blocked because conflicting record IDs were found.");
      return;
    }

    try {
      setProcessing(true);

      const currentRecords = EvidenceRepository.list();

      const result =
        await EvidenceBackupImportService.importNewRecords(
          backup,
          currentRecords
        );

      EvidenceRepository.saveAll(result.records);
      setImportResult(result);
      setMessage("Trusted backup imported successfully.");
      onImportComplete();
    } catch (error) {
      console.error("Backup import failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Backup import failed."
      );
    } finally {
      setProcessing(false);
    }
  }

  const canImport =
    Boolean(backup && trustResult?.trusted && preview) &&
    preview?.conflictingRecordIds === 0 &&
    !processing;

  return (
    <section className="vault-import-preview">
      <strong>Backup Import and Recovery</strong>

      <p>
        Select a plain or encrypted Evidence Vault backup. Every backup is
        validated and integrity checked before importing.
      </p>

      <input
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        disabled={processing}
      />

      {fileName && <p>Selected Backup: {fileName}</p>}

      {encryptedBackup && !backup && (
        <div className="vault-import-result">
          <strong>Encrypted Backup Detected</strong>
          <p>Schema: {encryptedBackup.schema}</p>
          <p>Encryption: {encryptedBackup.encryption.algorithm}</p>
          <p>
            Key Derivation:{" "}
            {encryptedBackup.encryption.keyDerivation}
          </p>

          <label>
            Backup Password
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              disabled={processing}
            />
          </label>

          <button
            type="button"
            onClick={handleDecryptAndValidate}
            disabled={!password || processing}
          >
            Decrypt and Validate Backup
          </button>

          <p>
            The password is used only for this decryption attempt and is
            cleared immediately afterward.
          </p>
        </div>
      )}

      {trustResult && (
        <div className="vault-import-result">
          <strong>
            {trustResult.trusted
              ? "Backup Trusted"
              : "Backup Not Trusted"}
          </strong>

          <p>
            Structure Valid:{" "}
            {trustResult.structureValid ? "Yes" : "No"}
          </p>
          <p>
            Integrity Metadata Present:{" "}
            {trustResult.integrityPresent ? "Yes" : "No"}
          </p>
          <p>
            SHA-256 Integrity Verified:{" "}
            {trustResult.integrityVerified ? "Yes" : "No"}
          </p>

          {trustResult.errors.length > 0 && (
            <ul>
              {trustResult.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {backup && (
        <div className="vault-import-result">
          <strong>Trusted Backup Details</strong>
          <p>Schema: {backup.schema}</p>
          <p>Exported At: {backup.exportedAt}</p>
          <p>Records: {backup.recordCount}</p>
        </div>
      )}

      {preview && (
        <div className="vault-import-change-preview">
          <strong>Import Change Preview</strong>
          <p>Total Records: {preview.totalRecords}</p>
          <p>New Records: {preview.newRecords}</p>
          <p>Existing Records: {preview.existingRecords}</p>
          <p>
            Duplicate Fingerprints: {preview.duplicateFingerprints}
          </p>
          <p>
            Conflicting Record IDs: {preview.conflictingRecordIds}
          </p>

          <button
            type="button"
            onClick={handleImport}
            disabled={!canImport}
          >
            Import Trusted Records
          </button>
        </div>
      )}

      {importResult && (
        <div className="vault-import-change-preview">
          <strong>Import Result</strong>
          <p>Imported Records: {importResult.importedRecords}</p>
          <p>
            Skipped Existing Records:{" "}
            {importResult.skippedExistingRecords}
          </p>
          <p>
            Blocked Conflicting Records:{" "}
            {importResult.blockedConflictingRecords}
          </p>
        </div>
      )}

      {message && (
        <p className="vault-import-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

export default VaultImportPreview;
