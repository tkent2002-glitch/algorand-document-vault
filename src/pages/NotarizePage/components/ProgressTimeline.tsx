import type {
  AlgorandConfirmationResult,
  AlgorandProofTransactionDraft,
  AlgorandSignedProofTransaction,
  AlgorandSubmissionResult,
  NotarizationProof,
} from "../../../types";
import type { EvidenceRecord } from "../../../services";

type ProgressTimelineProps = {
  fileName: string;
  fileHash: string;
  proof: NotarizationProof | null;
  evidenceRecord: EvidenceRecord | null;
  serializedProofPayload: string;
  walletReady: boolean;
  transactionDraft: AlgorandProofTransactionDraft | null;
  signedTransaction: AlgorandSignedProofTransaction | null;
  submissionResult: AlgorandSubmissionResult | null;
  confirmationResult: AlgorandConfirmationResult | null;
};

function formatStep(
  complete: boolean,
  label: string
): string {
  return `${complete ? "Complete" : "Pending"}: ${label}`;
}

function ProgressTimeline({
  fileName,
  fileHash,
  proof,
  evidenceRecord,
  serializedProofPayload,
  walletReady,
  transactionDraft,
  signedTransaction,
  submissionResult,
  confirmationResult,
}: ProgressTimelineProps) {
  return (
    <div className="notarize-result">
      <strong>Notarization Progress</strong>

      <p>
        {formatStep(Boolean(fileName), "Document selected")}
      </p>

      <p>
        {formatStep(
          Boolean(fileHash),
          "SHA-256 hash generated"
        )}
      </p>

      <p>
        {formatStep(Boolean(proof), "Proof created")}
      </p>

      <p>
        {formatStep(
          Boolean(evidenceRecord),
          "Evidence record created"
        )}
      </p>

      <p>
        {formatStep(
          Boolean(serializedProofPayload),
          "Proof payload prepared"
        )}
      </p>

      <p>
        {formatStep(walletReady, "Pera Wallet connected")}
      </p>

      <p>
        {formatStep(
          Boolean(transactionDraft),
          "Algorand transaction prepared"
        )}
      </p>

      <p>
        {formatStep(
          Boolean(signedTransaction),
          "Transaction signed"
        )}
      </p>

      <p>
        {formatStep(
          Boolean(submissionResult),
          "Transaction submitted"
        )}
      </p>

      <p>
        {formatStep(
          Boolean(confirmationResult),
          "Blockchain confirmation received"
        )}
      </p>
    </div>
  );
}

export default ProgressTimeline;