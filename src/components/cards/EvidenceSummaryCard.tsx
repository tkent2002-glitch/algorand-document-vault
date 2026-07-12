import "./EvidenceSummaryCard.css";

type EvidenceSummaryCardProps = {
  payloadJson: string;
};

function shorten(value: string): string {
  if (value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-10)}`;
}

function EvidenceSummaryCard({ payloadJson }: EvidenceSummaryCardProps) {
  if (!payloadJson) {
    return null;
  }

  const payload = JSON.parse(payloadJson) as {
    schema: string;
    proofType: string;
    hashAlgorithm: string;
    hash: string;
  };

  const payloadSizeBytes = new TextEncoder().encode(payloadJson).byteLength;

  return (
    <div className="evidence-summary-card">
      <strong>Evidence Summary</strong>

      <div className="evidence-summary-grid">
        <div>
          <span>Status</span>
          <p>Ready</p>
        </div>

        <div>
          <span>Proof Type</span>
          <p>{payload.proofType}</p>
        </div>

        <div>
          <span>Algorithm</span>
          <p>{payload.hashAlgorithm}</p>
        </div>

        <div>
          <span>Schema</span>
          <p>{payload.schema}</p>
        </div>

        <div>
          <span>Fingerprint</span>
          <code>{shorten(payload.hash)}</code>
        </div>

        <div>
          <span>Payload Size</span>
          <p>{payloadSizeBytes} bytes</p>
        </div>
      </div>

      <details>
        <summary>Show Technical Details</summary>
        <pre>
          <code>{JSON.stringify(payload, null, 2)}</code>
        </pre>
      </details>
    </div>
  );
}

export default EvidenceSummaryCard;
