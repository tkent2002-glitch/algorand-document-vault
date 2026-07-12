import { useState } from "react";
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

async function createTrustedBackupPayload() {
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

      const backup = await createTrustedBackupPayload();

      downloadJsonFile(
        `algorand-document-vault-backup-${Date.now()}.json`,
        backup
      );

      setMessage("Plain Evidence Vault backup exported successfully.");
    } catch (error) {
      console.error("Plain backup export failed:", error);
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

      const trustedBackup = await createTrustedBackupPayload();

      const encryptedBackup = await BackupEncryptionService.encrypt(
        trustedBackup,
        password
      );

      downloadJsonFile(
        `algorand-document-vault-encrypted-backup-${Date.now()}.json`,
        encryptedBackup
      );

      setPassword("");
      setConfirmPassword("");
      setMessage("Encrypted Evidence Vault backup exported successfully.");
    } catch (error) {
      console.error("Encrypted backup export failed:", error);
      setMessage("Encrypted backup export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="vault-backup-actions">
      <div>
        <strong>Vault Backup</strong>
        <p>
          Export Evidence Vault records without storing the original documents.
        </p>
      </div>

      <div className="vault-backup-option">
        <h3>Plain JSON Backup</h3>
        <p>
          Human-readable and integrity protected, but not confidential.
        </p>

        <button
          type="button"
          onClick={handlePlainExport}
          disabled={exporting}
        >
          Export Plain Backup
        </button>
      </div>

      <div className="vault-backup-option">
        <h3>Encrypted Backup</h3>
        <p>
          Encrypt the integrity-protected backup using AES-GCM and a password
          derived key.
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

        <button
          type="button"
          onClick={handleEncryptedExport}
          disabled={exporting}
        >
          Export Encrypted Backup
        </button>

        <p className="vault-backup-warning">
          The password is not stored or recoverable. Losing it means the
          encrypted backup cannot be opened.
        </p>
      </div>

      {message && (
        <p className="vault-backup-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

export default VaultBackupActions;
