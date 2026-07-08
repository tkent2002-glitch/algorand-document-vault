import { AlgorandExplorerService } from "../../services";
import type { EvidenceRecord } from "../../services";
import StatusBadge from "../status/StatusBadge";
import "./EvidenceDetailsPanel.css";

type EvidenceDetailsPanelProps = {
  record: EvidenceRecord | null;
};

function EvidenceDetailsPanel({ record }: EvidenceDetailsPanelProps) {
  if (!record) {
    return null;
  }

  const explorerUrl = record.algorandTransactionId
    ? AlgorandExplorerService.getTransactionUrl(record.algorandTransactionId)
    : "";

  return (
    <section className="evidence-details-panel">
      <div className="evidence-details-header">
        <div>
          <p className="evidence-details-eyebrow">Evidence Report</p>
          <h2>{record.documentName}</h2>
        </div>

        <StatusBadge status={record.status} />
      </div>

      <div className="evidence-details-grid">
        <div>
          <span>Status</span>
          <strong>{record.status}</strong>
        </div>

        <div>
          <span>Created</span>
          <strong>{new Date(record.createdAt).toLocaleString()}</strong>
        </div>

        <div>
          <span>Hash Algorithm</span>
          <strong>{record.hashAlgorithm}</strong>
        </div>

        <div>
          <span>Record ID</span>
          <code>{record.id}</code>
        </div>
      </div>

      <div className="evidence-details-section">
        <h3>Document Fingerprint</h3>
        <code>{record.hashValue}</code>
      </div>

      <div className="evidence-details-section">
        <h3>Blockchain Status</h3>
        <p>Network: Algorand TestNet</p>
        <p>Transaction: {record.algorandTransactionId ?? "Pending"}</p>
        <p>Submitted At: {record.submittedAt ?? "Pending"}</p>
        <p>Confirmed Round: {record.confirmedRound ?? "Pending"}</p>
        <p>Confirmed At: {record.confirmedAt ?? "Pending"}</p>

        {explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            View on Pera Explorer
          </a>
        )}
      </div>

      <div className="evidence-details-section">
        <h3>Available Actions</h3>
        <div className="evidence-details-actions">
          <button type="button" disabled>
            Verify Coming Soon
          </button>
          <button type="button" disabled>
            Export Report Coming Soon
          </button>
        </div>
      </div>

      <div className="evidence-details-section">
        <h3>Proof Boundary</h3>
        <p>
          This record proves document integrity only. It does not prove legal
          validity, ownership, truthfulness, or enforceability.
        </p>
      </div>
    </section>
  );
}

export default EvidenceDetailsPanel;
