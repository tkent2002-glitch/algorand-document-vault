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

        <h2>
          Verify document integrity against your Evidence Vault.
        </h2>

        <p>
          Select a document to calculate its SHA-256 fingerprint
          locally and compare it against evidence stored on this
          device. The document itself is never uploaded.
        </p>
      </div>

      <div className="verify-workspace">
        <div className="verify-card">
          <strong>Step 1 - Select Document</strong>

          <p>
            Choose the exact document you want to compare against
            your local Evidence Vault.
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

        <div className="verify-card">
          <strong>Step 2 - SHA-256 Fingerprint</strong>

          {fileName ? (
            <>
              <p>
                <strong>Selected File:</strong> {fileName}
              </p>

              {hashValue ? (
                <>
                  <p>
                    This fingerprint was generated from the selected
                    file in your browser.
                  </p>
                  <code>{hashValue}</code>
                </>
              ) : (
                <p>Fingerprint calculation is in progress.</p>
              )}
            </>
          ) : (
            <p>No document selected yet.</p>
          )}
        </div>

        <div className="verify-card verify-progress">
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
                  {stage.complete ? "OK" : index + 1}
                    </span>
                  </div>

                  <p>{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="verify-card">
          <strong>Verification Result</strong>

          {!checked && (
            <p>
              Select a document to run verification.
            </p>
          )}

          {checked && match && (
            <div className="verify-success" role="status">
              <strong>Fingerprint Match Found</strong>

              <p>
                The selected document produces the same SHA-256
                fingerprint as a record in your Evidence Vault.
              </p>

              <p>
                This supports document integrity: the file matches the
                content fingerprint previously recorded in the Vault.
              </p>
            </div>
          )}

          {checked && !match && (
            <div className="verify-warning" role="status">
              <strong>No Local Evidence Match Found</strong>

              <p>
                No record on this device contains the same SHA-256
                fingerprint.
              </p>

              <p>
                This does not prove that the document is invalid,
                altered, or fraudulent. It only means that no matching
                local evidence record was found.
              </p>
            </div>
          )}
        </div>

        <div className="verify-card verify-boundary">
          <strong>What Verification Proves</strong>

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

