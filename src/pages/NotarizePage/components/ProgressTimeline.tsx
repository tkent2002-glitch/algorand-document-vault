import type {
  AlgorandProofTransactionDraft,
  AlgorandSignedProofTransaction,
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
}: ProgressTimelineProps) {
  return (
    <div className="notarize-result">
      <strong>Notarization Progress</strong>
      <p>{fileName ? "Complete: Document selected" : "Pending: Document selected"}</p>
      <p>{fileHash ? "Complete: SHA-256 hash generated" : "Pending: SHA-256 hash generated"}</p>
      <p>{proof ? "Complete: Proof created" : "Pending: Proof created"}</p>
      <p>{evidenceRecord ? "Complete: Evidence record created" : "Pending: Evidence record created"}</p>
      <p>{serializedProofPayload ? "Complete: Payload prepared" : "Pending: Payload prepared"}</p>
      <p>{walletReady ? "Complete: Wallet connected" : "Pending: Wallet connected"}</p>
      <p>{transactionDraft ? "Complete: Transaction draft prepared" : "Pending: Transaction draft prepared"}</p>
      <p>{signedTransaction ? "Complete: Transaction signed" : "Pending: Transaction signed"}</p>
      <p>Pending: Transaction submitted</p>
      <p>Pending: Confirmation received</p>
    </div>
  );
}

export default ProgressTimeline;
