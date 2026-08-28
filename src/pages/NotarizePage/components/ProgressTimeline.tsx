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

type ProgressStage = {
  label: string;
  description: string;
  complete: boolean;
};

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
  const documentPrepared = Boolean(
    fileName &&
      fileHash &&
      proof &&
      evidenceRecord &&
      serializedProofPayload
  );

  const stages: ProgressStage[] = [
    {
      label: "Document",
      description: "Document selected and cryptographic proof prepared.",
      complete: documentPrepared,
    },
    {
      label: "Wallet",
      description: "Pera Wallet connected.",
      complete: walletReady,
    },
    {
      label: "Transaction",
      description: "Algorand transaction prepared for review.",
      complete: Boolean(transactionDraft),
    },
    {
      label: "Signature",
      description: "Transaction approved and signed with Pera Wallet.",
      complete: Boolean(signedTransaction),
    },
    {
      label: "Submission",
      description: "Signed transaction submitted to Algorand TestNet.",
      complete: Boolean(submissionResult),
    },
    {
      label: "Confirmation",
      description: "Blockchain confirmation received.",
      complete: Boolean(confirmationResult),
    },
  ];

  const completedStages = stages.filter(
    (stage) => stage.complete
  ).length;

  return (
    <div className="notarize-result notarize-progress">
      <div className="notarize-progress-header">
        <strong>Notarization Progress</strong>
        <span>
          {completedStages} of {stages.length} stages complete
        </span>
      </div>

      <ol className="notarize-progress-list">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            className={
              stage.complete
                ? "notarize-progress-stage complete"
                : "notarize-progress-stage pending"
            }
          >
            <div className="notarize-progress-marker">
              {stage.complete ? "✓" : index + 1}
            </div>

            <div className="notarize-progress-content">
              <div className="notarize-progress-stage-header">
                <strong>{stage.label}</strong>
                <span>
                  {stage.complete ? "Complete" : "Pending"}
                </span>
              </div>

              <p>{stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default ProgressTimeline;