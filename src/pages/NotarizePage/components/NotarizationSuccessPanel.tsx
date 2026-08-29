import { AlgorandExplorerService } from "../../../services";
import type { EvidenceRecord } from "../../../services";
import type { AlgorandConfirmationResult } from "../../../types";

type NotarizationSuccessPanelProps = {
  confirmationResult: AlgorandConfirmationResult | null;
  evidenceRecord: EvidenceRecord | null;
};

function shorten(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function NotarizationSuccessPanel({
  confirmationResult,
  evidenceRecord,
}: NotarizationSuccessPanelProps) {
  if (!confirmationResult) {
    return null;
  }

  const explorerUrl = AlgorandExplorerService.getTransactionUrl(
    confirmationResult.transactionId
  );

  return (
    <div className="notarize-result notarization-success">
      <div className="notarization-success-header" role="status">
        <div
          className="notarization-success-marker"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <strong>Notarization complete</strong>
          <p>
            Confirmed on Algorand TestNet and saved to your local Vault.
          </p>
        </div>
      </div>

      <dl className="notarization-success-receipt">
        {evidenceRecord && (
          <div>
            <dt>Document</dt>
            <dd>{evidenceRecord.documentName}</dd>
          </div>
        )}

        {evidenceRecord && (
          <div>
            <dt>Fingerprint</dt>
            <dd>
              <code title={evidenceRecord.hashValue}>
                {shorten(evidenceRecord.hashValue)}
              </code>
            </dd>
          </div>
        )}

        <div>
          <dt>Transaction</dt>
          <dd>
            <code title={confirmationResult.transactionId}>
              {shorten(confirmationResult.transactionId)}
            </code>
          </dd>
        </div>

        <div>
          <dt>Confirmed round</dt>
          <dd>{confirmationResult.confirmedRound}</dd>
        </div>

        <div>
          <dt>Confirmed</dt>
          <dd>
            <time dateTime={confirmationResult.confirmedAt}>
              {new Date(confirmationResult.confirmedAt).toLocaleString()}
            </time>
          </dd>
        </div>

        {evidenceRecord && (
          <div>
            <dt>Evidence record</dt>
            <dd>
              <code title={evidenceRecord.id}>
                {shorten(evidenceRecord.id)}
              </code>
            </dd>
          </div>
        )}
      </dl>

      <div className="notarization-success-actions">
        <a
          className="explorer-link"
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Pera Explorer
        </a>
      </div>

      <details className="notarization-success-boundary">
        <summary>What this confirmation proves</summary>
        <p>
          The blockchain confirmation establishes evidence of the
          document fingerprint at this point in time. It does not
          establish the document's legal validity, ownership, or
          truthfulness.
        </p>
      </details>
    </div>
  );
}

export default NotarizationSuccessPanel;
