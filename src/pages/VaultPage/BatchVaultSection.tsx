import { useEffect, useState } from "react";
import { BatchEvidenceRepository } from "../../repositories/evidence/BatchEvidenceRepository";
import {
  AlgorandExplorerService,
  VerificationLinkService,
  type BatchEvidenceMemberRecord,
  type BatchEvidenceRecord,
} from "../../services";

type BatchWithMembers = {
  batch: BatchEvidenceRecord;
  members: BatchEvidenceMemberRecord[];
};

export default function BatchVaultSection() {
  const [batches, setBatches] = useState<BatchWithMembers[]>([]);
  const [shareLink, setShareLink] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void BatchEvidenceRepository.listBatchesAsync().then(async (records) => {
      const values = await Promise.all(
        records.map(async (batch) => ({
          batch,
          members: await BatchEvidenceRepository.listMembersAsync(batch.id),
        }))
      );
      if (active) setBatches(values);
    });
    return () => { active = false; };
  }, []);

  async function createLink(
    batch: BatchEvidenceRecord,
    member: BatchEvidenceMemberRecord
  ) {
    try {
      const link = await VerificationLinkService.createMerkleUrl(batch, member);
      setShareLink(link);
      setMessage(`Verification link ready for ${member.documentName}.`);
      await navigator.clipboard?.writeText(link);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create the link.");
    }
  }

  if (batches.length === 0) return null;

  return (
    <section className="batch-vault-section">
      <div>
        <p className="vault-eyebrow">Merkle batches</p>
        <h3>Batch anchors</h3>
        <p>Each group uses one Algorand transaction and retains a proof for every document.</p>
      </div>
      {batches.map(({ batch, members }) => (
        <details key={batch.id} className="batch-vault-group">
          <summary>
            <span className="batch-vault-summary-copy">
              <strong>{batch.leafCount} documents</strong>
              <small>{batch.status} · {new Date(batch.createdAt).toLocaleString()}</small>
              <small className="batch-vault-expand-label">
                View documents and create verification links
              </small>
            </span>
            <span className="batch-vault-summary-action">
              <code>{batch.merkleRoot.slice(0, 12)}…</code>
              <span className="batch-vault-chevron" aria-hidden="true">›</span>
            </span>
          </summary>
          <div className="batch-vault-members">
            {batch.algorandTransactionId && (
              <a
                href={AlgorandExplorerService.getTransactionUrl(batch.algorandTransactionId)}
                target="_blank"
                rel="noreferrer"
              >
                View batch transaction
              </a>
            )}
            {members.map((member) => (
              <div className="batch-vault-member" key={member.id}>
                <span><strong>{member.documentName}</strong><code>{member.hashValue}</code></span>
                <button
                  type="button"
                  disabled={batch.status !== "confirmed"}
                  onClick={() => void createLink(batch, member)}
                >
                  Create verification link
                </button>
              </div>
            ))}
          </div>
        </details>
      ))}
      {message && <p role="status">{message}</p>}
      {shareLink && (
        <div className="batch-share-link">
          <label htmlFor="batch-verification-link">Selected document link</label>
          <textarea id="batch-verification-link" readOnly value={shareLink} rows={3} />
          <button type="button" onClick={() => void navigator.clipboard?.writeText(shareLink)}>
            Copy link
          </button>
        </div>
      )}
    </section>
  );
}
