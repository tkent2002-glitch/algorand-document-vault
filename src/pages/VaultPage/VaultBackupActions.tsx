import { EvidenceRepository } from "../../repositories";
import { BackupIntegrityService } from "../../services";
import "./VaultBackupActions.css";

function VaultBackupActions() {
  async function handleExport() {
    const records = EvidenceRepository.list();

    const backupPayload = {
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records,
    };

    const integrity = await BackupIntegrityService.createIntegrity(backupPayload);

    const backup = {
      ...backupPayload,
      integrity,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `algorand-document-vault-backup-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="vault-backup-actions">
      <strong>Vault Backup</strong>
      <p>Export your local Evidence Vault records as a JSON backup file.</p>
      <button type="button" onClick={handleExport}>
        Export Evidence Vault
      </button>
    </div>
  );
}

export default VaultBackupActions;
