import { AlgorandExplorerService } from "../../../services";
import type {
  AlgorandConfirmationResult,
} from "../../../types";
import type { EvidenceRecord } from "../../../services";

type NotarizationSuccessPanelProps = {
  confirmationResult: AlgorandConfirmationResult | null;
  evidenceRecord: EvidenceRecord | null;
};

function NotarizationSuccessPanel({
  confirmationResult,
  evidenceRecord,
}: NotarizationSuccessPanelProps) {
  if (!confirmationResult) {
    return null;
  }

  const explorerUrl =
    AlgorandExplorerService.getTransactionUrl(
      confirmationResult.transactionId
    );

  return (
    <div
      className="notarize-result notarization-success"
      role="status"
    >
      <div className="notarization-success-header">
        <div
          className="notarization-success-marker"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <strong>Notarization Complete</strong>
          <p>
            The transaction has been confirmed on Algorand
            TestNet.
          </p>
        </div>
      </div>

      <div className="notarization-success-details">
        <p>
          <strong>Transaction ID:</strong>{" "}
          <code>{confirmationResult.transactionId}</code>
        </p>

        <p>
          <strong>Confirmed Round:</strong>{" "}
          {confirmationResult.confirmedRound}
        </p>

        <p>
          <strong>Confirmed At:</strong>{" "}
          {confirmationResult.confirmedAt}
        </p>

        {evidenceRecord && (
          <>
            <p>
              <strong>Evidence Record:</strong>{" "}
              <code>{evidenceRecord.id}</code>
            </p>

            <p>
              Your confirmed evidence record has been saved
              locally and is available from the Vault.
            </p>
          </>
        )}
      </div>

      <a
        className="explorer-link"
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Confirmed Transaction on Pera Explorer
      </a>

      <p className="notarization-success-boundary">
        The blockchain confirmation establishes evidence of the
        document fingerprint at this point in time. It does not
        establish the document's legal validity, ownership, or
        truthfulness.
      </p>
    </div>
  );
}

export default NotarizationSuccessPanel;
