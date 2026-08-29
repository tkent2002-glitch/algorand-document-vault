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

function VaultBackupActions() {
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
          <h3>Export evidence records</h3>
          <p>
            Choose a readable JSON file or a password-encrypted backup.
          </p>
        </div>
      </div>

      <div className="vault-backup-options-grid">
        <div className="vault-backup-option">
          <div className="vault-backup-option-header">
            <div>
              <h3>Plain JSON Backup</h3>
              <p>
                Easy to inspect and protected against unnoticed changes.
              </p>
            </div>

            <span>Readable</span>
          </div>

          <p className="vault-backup-option-security">
            Integrity protected · Not encrypted
          </p>

          <button
            type="button"
            onClick={handlePlainExport}
            disabled={exporting}
          >
            {exporting
              ? "Export in Progress..."
              : "Export Plain Backup"}
          </button>
        </div>

        <div className="vault-backup-option">
          <div className="vault-backup-option-header">
            <div>
              <h3>Encrypted Backup</h3>
              <p>
                Password protected for safer storage or transfer.
              </p>
            </div>

            <span>Encrypted</span>
          </div>

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
      </div>

      <p
        className="vault-backup-message"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
      </p>

      <p className="vault-backup-boundary">
        Backups contain evidence records and metadata only—never your
        original documents.
      </p>
    </section>
  );
}

export default VaultBackupActions;
