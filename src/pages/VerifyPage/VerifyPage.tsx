import { useState } from "react";
import EvidenceCard from "../../components/cards/EvidenceCard";
import EvidenceDetailsPanel from "../../components/evidence/EvidenceDetailsPanel";
import { EvidenceRepository } from "../../repositories";
import { HashService } from "../../services";
import type { EvidenceRecord } from "../../services";
import "./VerifyPage.css";

type VerificationStage = {
  label: string;
  description: string;
  complete: boolean;
};

function VerifyPage() {
  const [fileName, setFileName] = useState<string>("");
  const [hashValue, setHashValue] = useState<string>("");
  const [match, setMatch] = useState<EvidenceRecord | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] =
    useState<EvidenceRecord | null>(null);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setChecked(false);
    setMatch(null);
    setSelectedRecord(null);
    setHashValue("");
    setFileName(file?.name ?? "");

    if (!file) {
      return;
    }

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

  const stages: VerificationStage[] = [
    {
      label: "Document",
      description: "Document selected for local verification.",
      complete: Boolean(fileName),
    },
    {
      label: "Fingerprint",
      description: "SHA-256 fingerprint generated locally.",
      complete: Boolean(hashValue),
    },
    {
      label: "Vault Search",
      description: "Evidence Vault searched for a matching fingerprint.",
      complete: checked,
    },
    {
      label: "Result",
      description: "Verification result available.",
      complete: checked,
    },
  ];

  const completedStages = stages.filter(
    (stage) => stage.complete
  ).length;

  return (
    <section className="page verify-page">
      <div className="verify-header">
        <p className="verify-eyebrow">Document Verification</p>

        <h2>Verify Document</h2>

        <p>
          Calculate a SHA-256 fingerprint locally and compare it with
          evidence stored on this device. Your document is never
          uploaded.
        </p>
      </div>

      <div className="verify-workspace">
        <div className="verify-primary-grid">
          <div className="verify-card verify-select-card">
            <span className="verify-step-label">Step 1</span>
            <strong>Select a document</strong>

            <p>
              Choose the exact file you want to compare with your
              local Evidence Vault.
            </p>

            <label htmlFor="verification-document">
              Document to verify
            </label>

            <input
              id="verification-document"
              type="file"
              onChange={handleFileChange}
              disabled={processing}
            />

            {processing && (
              <p role="status">
                Calculating fingerprint and searching the Vault...
              </p>
            )}
          </div>

          <div
            className={
              checked && match
                ? "verify-card verify-result-card matched"
                : checked
                  ? "verify-card verify-result-card unmatched"
                  : "verify-card verify-result-card"
            }
          >
            <span className="verify-step-label">Result</span>
            <strong>Verification status</strong>

            {!checked && (
              <p>
                Select a document to compare its fingerprint with
                local evidence.
              </p>
            )}

            {checked && match && (
              <div className="verify-success" role="status">
                <strong>Fingerprint Match Found</strong>
                <p>
                  This document matches evidence stored in your local
                  Vault.
                </p>
              </div>
            )}

            {checked && !match && (
              <div className="verify-warning" role="status">
                <strong>No Local Evidence Match Found</strong>
                <p>
                  No record on this device contains the same
                  fingerprint. This does not prove the document is
                  invalid or altered.
                </p>
              </div>
            )}
          </div>
        </div>

        {fileName && (
          <div className="verify-fingerprint" role="status">
            <div>
              <span>Selected document</span>
              <strong>{fileName}</strong>
            </div>
            <div>
              <span>SHA-256 fingerprint</span>
              {hashValue ? (
                <code>{hashValue}</code>
              ) : (
                <strong>Calculating...</strong>
              )}
            </div>
          </div>
        )}

        <div className="verify-progress">
          <div className="verify-progress-header">
            <strong>Verification Progress</strong>
            <span>
              {completedStages} of {stages.length} stages complete
            </span>
          </div>

          <ol className="verify-progress-list">
            {stages.map((stage, index) => (
              <li
                key={stage.label}
                className={
                  stage.complete
                    ? "verify-progress-stage complete"
                    : "verify-progress-stage pending"
                }
              >
                <div className="verify-progress-marker">
                  {stage.complete ? "OK" : index + 1}
                </div>

                <div className="verify-progress-content">
                  <div className="verify-progress-stage-header">
                    <strong>{stage.label}</strong>
                    <span>
                      {stage.complete ? "Complete" : "Pending"}
                    </span>
                  </div>

                  <p className="visually-hidden">{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <details className="verify-boundary">
          <summary>
            What verification does—and does not—prove
          </summary>

          <div>
            <p>
              A matching SHA-256 fingerprint supports the conclusion
              that the selected file has the same content as the file
              represented by the stored evidence record.
            </p>

            <p>
              It does not establish authorship, ownership, legal
              validity, truthfulness, or enforceability of the document.
            </p>
          </div>
        </details>
      </div>

      {match && (
        <div className="verify-match">
          <h2>Matching Evidence Record</h2>
          <EvidenceCard
            record={match}
            onViewDetails={setSelectedRecord}
          />

          {selectedRecord && (
            <div className="verify-details">
              <EvidenceDetailsPanel record={selectedRecord} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default VerifyPage;

