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

      <div className="evidence-details-section blockchain-section">
        <h3>Blockchain Evidence</h3>

        <div className="blockchain-metadata-grid">
          <div>
            <span>Network</span>
            <strong>Algorand TestNet</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{record.status}</strong>
          </div>

          <div>
            <span>Transaction ID</span>
            <code>{record.algorandTransactionId ?? "Pending"}</code>
          </div>

          <div>
            <span>Submitted At</span>
            <strong>{record.submittedAt ?? "Pending"}</strong>
          </div>

          <div>
            <span>Confirmed Round</span>
            <strong>{record.confirmedRound ?? "Pending"}</strong>
          </div>

          <div>
            <span>Confirmed At</span>
            <strong>{record.confirmedAt ?? "Pending"}</strong>
          </div>
        </div>

        {explorerUrl && (
          <a
            className="explorer-link"
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            View transaction on Pera Explorer
          </a>
        )}
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
