import type { EvidenceRecord } from "../../../services";

type DuplicateEvidenceWarningProps = {
  duplicateRecord: EvidenceRecord | null;
};

function DuplicateEvidenceWarning({
  duplicateRecord,
}: DuplicateEvidenceWarningProps) {
  if (!duplicateRecord) {
    return null;
  }

  return (
    <div className="notarize-result duplicate-warning">
      <strong>Document Already Exists</strong>
      <p>This document hash already exists in your Evidence Vault.</p>
      <p>Existing Record: {duplicateRecord.documentName}</p>
      <p>Status: {duplicateRecord.status}</p>
      <p>Created: {duplicateRecord.createdAt}</p>
      <p>
        For now, this is a warning only. In a later milestone we will let the
        user choose whether to reuse the existing record or create a new proof.
      </p>
    </div>
  );
}

export default DuplicateEvidenceWarning;
