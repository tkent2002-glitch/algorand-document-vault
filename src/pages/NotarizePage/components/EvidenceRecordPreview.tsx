import type { EvidenceRecord } from "../../../services";

type EvidenceRecordPreviewProps = {
  evidenceRecord: EvidenceRecord | null;
};

function EvidenceRecordPreview({ evidenceRecord }: EvidenceRecordPreviewProps) {
  if (!evidenceRecord) {
    return null;
  }

  return (
    <div className="notarize-result">
      <strong>Evidence Record Preview</strong>
      <p>Record ID: {evidenceRecord.id}</p>
      <p>Status: {evidenceRecord.status}</p>
      <p>Document Name: {evidenceRecord.documentName}</p>
      <p>Created At: {evidenceRecord.createdAt}</p>
    </div>
  );
}

export default EvidenceRecordPreview;
