import { useEffect, useState } from "react";
import EvidenceCard from "../../components/cards/EvidenceCard";
import EvidenceDetailsPanel from "../../components/evidence/EvidenceDetailsPanel";
import { EvidenceRepository } from "../../repositories";
import { HashService, VerificationLinkService } from "../../services";
import type {
  EvidenceRecord,
  VerificationLinkEnvelope,
} from "../../services";
import SharedProofVerifier from "./SharedProofVerifier";
import "./VerifyPage.css";

type EvidenceSource = "local" | "shared";

function VerifyPage() {
  const hasVerificationLink = VerificationLinkService.hasVerificationHash(
    window.location.hash
  );
  const [source, setSource] = useState<EvidenceSource>(
    hasVerificationLink ? "shared" : "local"
  );
  const [verificationLink, setVerificationLink] =
    useState<VerificationLinkEnvelope | null>(null);
  const [linkLoading, setLinkLoading] = useState(hasVerificationLink);
  const [linkError, setLinkError] = useState("");
  const [fileName, setFileName] = useState("");
  const [hashValue, setHashValue] = useState("");
  const [match, setMatch] = useState<EvidenceRecord | null>(null);
  const [checked, setChecked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<EvidenceRecord | null>(null);

  useEffect(() => {
    let active = true;

    if (!hasVerificationLink) {
      return () => {
        active = false;
      };
    }

    void VerificationLinkService.parseHash(window.location.hash).then(
      (result) => {
        if (!active) return;

        setLinkLoading(false);
        if (!result.valid || !result.envelope) {
          setLinkError(
            result.errors[0] ?? "This verification link is invalid or incomplete."
          );
          return;
        }

        setVerificationLink(result.envelope);
      }
    );

    return () => {
      active = false;
    };
  }, [hasVerificationLink]);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setChecked(false);
    setMatch(null);
    setSelectedRecord(null);
    setHashValue("");
    setFileName(file?.name ?? "");

    if (!file) return;

    try {
      setProcessing(true);
      const hash = await HashService.sha256FromFile(file);
      const records = await EvidenceRepository.listAsync();
      const matchingRecord =
        records.find((record) => record.hashValue === hash) ?? null;

      setHashValue(hash);
      setMatch(matchingRecord);
      setChecked(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="page verify-page">
      <div className="verify-header">
        <p className="verify-eyebrow">Document Verification</p>
        <h2>Verify Document</h2>
        <p>
          Follow three steps to compare a document with evidence on this
          device or a shared Algorand verification link. The document stays on
          your device.
        </p>
      </div>

      <div className="verify-guided-flow">
        <section className="verify-flow-step" aria-labelledby="verify-step-one">
          <span className="verify-step-label">Step 1</span>
          <h3 id="verify-step-one">
            {verificationLink
              ? `Select ${verificationLink.documentLabel}`
              : "Select the document"}
          </h3>
          <p>
            {verificationLink
              ? "Choose the document the sender gave you. The displayed name is guidance; the fingerprint is what proves a match."
              : "Choose the exact document you want to verify."}
          </p>
          <label htmlFor="verification-document">Document to verify</label>
          <input
            id="verification-document"
            type="file"
            onChange={handleFileChange}
            disabled={processing}
          />
          {processing && <p role="status">Calculating its fingerprint...</p>}

          {fileName && (
            <div className="verify-selected-document" role="status">
              <div>
                <span>Selected document</span>
                <strong>{fileName}</strong>
              </div>
              <div>
                <span>SHA-256 fingerprint</span>
                {hashValue ? <code>{hashValue}</code> : <strong>Calculating...</strong>}
              </div>
            </div>
          )}
        </section>

        <section className="verify-flow-step" aria-labelledby="verify-step-two">
          <span className="verify-step-label">Step 2</span>
          <h3 id="verify-step-two">Choose where to verify</h3>
          <p>Use your own Vault, or use a verification link from the owner.</p>

          <div className="verify-source-options">
            <button
              type="button"
              aria-label="Local verification"
              className={source === "local" ? "active" : ""}
              onClick={() => setSource("local")}
            >
              <strong>This device&apos;s Vault</strong>
              <span>Check records saved in this browser.</span>
            </button>
            <button
              type="button"
              aria-label="Shared verification"
              className={source === "shared" ? "active" : ""}
              onClick={() => setSource("shared")}
            >
              <strong>Shared verification</strong>
              <span>Use a link or technical proof from the owner.</span>
            </button>
          </div>

          {source === "local" && (
            <div className="verify-source-summary">
              {checked
                ? "This device's Evidence Vault has been searched."
                : "Select a document in Step 1 to search this device's Vault."}
            </div>
          )}

          {source === "shared" && linkLoading && (
            <p className="verify-source-summary" role="status">
              Loading verification link...
            </p>
          )}
          {source === "shared" && linkError && (
            <p className="verify-source-error" role="alert">{linkError}</p>
          )}
          {!linkLoading && !linkError && (
            <div hidden={source !== "shared"}>
              <SharedProofVerifier
                documentHash={hashValue}
                initialProof={verificationLink?.proof}
                documentLabel={verificationLink?.documentLabel}
              />
            </div>
          )}
        </section>

        {source === "local" && (
          <section className="verify-flow-step" aria-labelledby="verify-step-three">
            <span className="verify-step-label">Step 3</span>
            <h3 id="verify-step-three">Review result</h3>

            {!checked && (
              <div className="verify-final-result ready">
                <strong>Waiting for a document</strong>
                <p>Complete Step 1 to see the local verification result.</p>
              </div>
            )}
            {checked && match && (
              <div className="verify-final-result verified" role="status">
                <strong>Local fingerprint match found</strong>
                <p>This document matches evidence saved in this device&apos;s Vault.</p>
              </div>
            )}
            {checked && !match && (
              <div className="verify-final-result failed" role="status">
                <strong>No local evidence match found</strong>
                <p>
                  No record on this device contains the same fingerprint. This
                  does not prove the document is invalid or altered.
                </p>
                <p>
                  If the owner sent a verification link, choose Shared
                  verification in Step 2.
                </p>
              </div>
            )}
          </section>
        )}

        <details className="verify-boundary">
          <summary>What verification does—and does not—prove</summary>
          <div>
            <p>
              A matching SHA-256 fingerprint supports the conclusion that the
              selected file has the same content as the file represented by the
              evidence.
            </p>
            <p>
              It does not establish authorship, ownership, legal validity,
              truthfulness, or enforceability of the document.
            </p>
          </div>
        </details>
      </div>

      {source === "local" && match && (
        <div className="verify-match">
          <h2>Matching Evidence Record</h2>
          <EvidenceCard
            record={match}
            detailsOpen={selectedRecord?.id === match.id}
            onViewDetails={(record) =>
              setSelectedRecord((currentRecord) =>
                currentRecord?.id === record.id ? null : record
              )
            }
          />
          {selectedRecord && (
            <div className="verify-details" id={`evidence-details-${selectedRecord.id}`}>
              <EvidenceDetailsPanel record={selectedRecord} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default VerifyPage;
