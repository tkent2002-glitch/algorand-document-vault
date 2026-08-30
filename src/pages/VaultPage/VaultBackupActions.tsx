import { useState } from "react";
import { Logger } from "../../core";
import { EvidenceRepository } from "../../repositories";
import {
  BackupEncryptionService,
  BackupIntegrityService,
} from "../../services";
import "./VaultBackupActions.css";

const MINIMUM_PASSWORD_LENGTH = 12;

function downloadJsonFile(fileName: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

async function createIntegrityProtectedBackupPayload() {
  const records = await EvidenceRepository.listAsync();

  const payload = {
    schema: "adv-evidence-backup-v1" as const,
    exportedAt: new Date().toISOString(),
    recordCount: records.length,
    records,
  };

  return {
    ...payload,
    integrity: await BackupIntegrityService.createIntegrity(payload),
  };
}

interface VaultBackupActionsProps {
  recordCount: number;
}

function VaultBackupActions({ recordCount }: VaultBackupActionsProps) {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  async function handlePlainExport() {
    try {
      setMessage("");
      setExporting(true);

      const backup = await createIntegrityProtectedBackupPayload();

      downloadJsonFile(
        `algorand-document-vault-backup-${Date.now()}.json`,
        backup
      );

      setMessage("Plain Evidence Vault backup exported successfully.");
    } catch {
      Logger.error("Plain backup export failed.");
      setMessage("Plain backup export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleEncryptedExport() {
    setMessage("");

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      setMessage(
        `Password must contain at least ${MINIMUM_PASSWORD_LENGTH} characters.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Backup passwords do not match.");
      return;
    }

    try {
      setExporting(true);

      const integrityProtectedBackup = await createIntegrityProtectedBackupPayload();

      const encryptedBackup = await BackupEncryptionService.encrypt(
        integrityProtectedBackup,
        password
      );

      downloadJsonFile(
        `algorand-document-vault-encrypted-backup-${Date.now()}.json`,
        encryptedBackup
      );

      setPassword("");
      setConfirmPassword("");
      setMessage("Encrypted Evidence Vault backup exported successfully.");
    } catch {
      Logger.error("Encrypted backup export failed.");
      setMessage("Encrypted backup export failed.");
    } finally {
      setExporting(false);
    }
  }

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordLongEnough =
    password.length >= MINIMUM_PASSWORD_LENGTH;

  return (
    <section className="vault-backup-actions">
      <div className="vault-backup-header">
        <div>
          <h3>Back up evidence records</h3>
          <p>
            Protect these {recordCount.toLocaleString()} locally stored record
            {recordCount === 1 ? "" : "s"} before changing browsers or devices.
          </p>
        </div>
      </div>

      <div className="vault-backup-choices">
        <details className="vault-backup-encrypted">
          <summary>
            <span>
              <strong>Encrypted backup</strong>
              <small>Recommended</small>
            </span>
          </summary>

          <div className="vault-backup-encrypted-fields">
          <p className="vault-backup-option-security">
            Integrity protected · AES-GCM encrypted
          </p>

          <label>
            Backup Password
            <input
              type="password"
              value={password}
              minLength={MINIMUM_PASSWORD_LENGTH}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <p className="vault-backup-password-status">
            Password length: {password.length} / {MINIMUM_PASSWORD_LENGTH}
            {" "}minimum
          </p>

          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              minLength={MINIMUM_PASSWORD_LENGTH}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>

          {confirmPassword.length > 0 && (
            <p className="vault-backup-password-status">
              Passwords: {passwordsMatch ? "Match" : "Do not match"}
            </p>
          )}

          <button
            type="button"
            onClick={handleEncryptedExport}
            disabled={exporting}
          >
            {exporting
              ? "Export in Progress..."
              : "Export Encrypted Backup"}
          </button>

          {!passwordLongEnough && password.length > 0 && (
            <p className="vault-backup-warning">
              Use at least {MINIMUM_PASSWORD_LENGTH} characters before
              exporting an encrypted backup.
            </p>
          )}

          <p className="vault-backup-warning">
            The backup password is never stored or recoverable. If it
            is lost, the encrypted backup cannot be opened.
          </p>
          </div>
        </details>

        <button
          className="vault-backup-plain"
          type="button"
          aria-label="Export Plain Backup"
          onClick={handlePlainExport}
          disabled={exporting}
        >
          <span>
            <strong>Plain JSON backup</strong>
            <small>Readable, not encrypted</small>
          </span>
        </button>
      </div>

      <p
        className="vault-backup-message"
        role="status"
        aria-label="Backup export status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
      </p>

      <p className="vault-backup-boundary">Original documents are never included.</p>
    </section>
  );
}

export default VaultBackupActions;
