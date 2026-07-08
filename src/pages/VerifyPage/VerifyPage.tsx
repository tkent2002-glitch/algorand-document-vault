import { useState } from "react";
import EvidenceCard from "../../components/cards/EvidenceCard";
import { EvidenceRepository } from "../../repositories";
import { HashService } from "../../services";
import type { EvidenceRecord } from "../../services";
import "./VerifyPage.css";

function VerifyPage() {
  const [fileName, setFileName] = useState<string>("");
  const [hashValue, setHashValue] = useState<string>("");
  const [match, setMatch] = useState<EvidenceRecord | null>(null);
  const [checked, setChecked] = useState<boolean>(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setChecked(false);
    setMatch(null);
    setHashValue("");
    setFileName(file?.name ?? "");

    if (!file) {
      return;
    }

    const hash = await HashService.sha256FromFile(file);
    const records = EvidenceRepository.list();
    const matchingRecord =
      records.find((record) => record.hashValue === hash) ?? null;

    setHashValue(hash);
    setMatch(matchingRecord);
    setChecked(true);
  }

  return (
    <section className="page verify-page">
      <div className="verify-header">
        <p className="verify-eyebrow">Document Verification</p>
        <h2>Verify document integrity against your Evidence Vault.</h2>
        <p>
          Upload a document to calculate its SHA-256 fingerprint and compare it
          against local evidence records. Documents are never uploaded or stored.
        </p>
      </div>

      <div className="verify-workspace">
        <div className="verify-card">
          <strong>Step 1 - Select Document</strong>
          <p>Choose the document you want to verify.</p>
          <input type="file" onChange={handleFileChange} />
        </div>

        <div className="verify-card">
          <strong>Step 2 - Generate SHA-256</strong>
          {fileName ? (
            <>
              <p>Selected File: {fileName}</p>
              {hashValue && <code>{hashValue}</code>}
            </>
          ) : (
            <p>No document selected yet.</p>
          )}
        </div>

        <div className="verify-card">
          <strong>Step 3 - Search Evidence Vault</strong>
          <p>
            The app compares the computed hash against locally stored evidence
            records.
          </p>
        </div>

        <div className="verify-card">
          <strong>Step 4 - Verification Result</strong>

          {!checked && <p>Verification has not run yet.</p>}

          {checked && match && (
            <div className="verify-success">
              <p>Hash match found.</p>
              <p>This document matches a local evidence record.</p>
            </div>
          )}

          {checked && !match && (
            <div className="verify-warning">
              <p>No local evidence match found.</p>
              <p>
                This does not prove the document is invalid. It only means no
                matching local evidence record was found on this device.
              </p>
            </div>
          )}
        </div>
      </div>

      {match && (
        <div className="verify-match">
          <h2>Matching Evidence Record</h2>
          <EvidenceCard record={match} />
        </div>
      )}
    </section>
  );
}

export default VerifyPage;


