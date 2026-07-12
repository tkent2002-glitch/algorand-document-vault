import type { EvidenceRecord } from "../../services";
import StatusBadge from "../status/StatusBadge";
import "./EvidenceCard.css";

type EvidenceCardProps = {
  record: EvidenceRecord;
  onViewDetails?: (record: EvidenceRecord) => void;
};

function shortenHash(hash: string): string {
  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

function EvidenceCard({ record, onViewDetails }: EvidenceCardProps) {
  return (
    <article className="evidence-card">
      <div className="evidence-card-header">
        <div>
          <p className="evidence-card-eyebrow">Evidence Record</p>
          <h3>{record.documentName}</h3>
        </div>

        <StatusBadge status={record.status} />
      </div>

      <div className="evidence-card-grid">
        <div>
          <span>Algorithm</span>
          <strong>{record.hashAlgorithm}</strong>
        </div>

        <div>
          <span>Created</span>
          <strong>{new Date(record.createdAt).toLocaleString()}</strong>
        </div>

        <div>
          <span>Hash</span>
          <code>{shortenHash(record.hashValue)}</code>
        </div>

        <div>
          <span>Record ID</span>
          <code>{shortenHash(record.id)}</code>
        </div>
      </div>

      {record.algorandTransactionId && (
        <div className="evidence-card-transaction">
          <span>Algorand Transaction</span>
          <code>{record.algorandTransactionId}</code>
        </div>
      )}

      <div className="evidence-card-actions">
        <button type="button" onClick={() => onViewDetails?.(record)}>
          View Details
        </button>
        <button type="button" disabled>
          Verify Coming Soon
        </button>
      </div>
    </article>
  );
}

export default EvidenceCard;
