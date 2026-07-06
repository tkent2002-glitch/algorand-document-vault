import { useState } from "react";
import { EvidenceRecordStoreService, HashService } from "../../services";
import type { EvidenceRecord } from "../../services";
import "./VerifyPage.css";

function VerifyPage() {
  const [fileName, setFileName] = useState("");
  const [hashValue, setHashValue] = useState("");
  const [match, setMatch] = useState<EvidenceRecord | null>(null);
  const [checked, setChecked] = useState(false);

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
    const records = EvidenceRecordStoreService.list();
    const matchingRecord =
      records.find((record) => record.hashValue === hash) ?? null;

    setHashValue(hash);
    setMatch(matchingRecord);
    setChecked(true);
  }

  return (
    <section className="page">
      <h2>Verify Document</h2>
      <p>Hash a document and compare it against local evidence records.</p>

      <div className="verify-panel">
        <input type="file" onChange={handleFileChange} />

        {fileName && (
          <div className="verify-result">
            <strong>Selected File:</strong>
            <p>{fileName}</p>
          </div>
        )}

        {hashValue && (
          <div className="verify-result">
            <strong>Computed SHA-256:</strong>
            <code>{hashValue}</code>
          </div>
        )}

        {checked && (
          <div className="verify-result">
            <strong>Verification Result:</strong>
            {match ? (
              <>
                <p>Hash match found in Evidence Vault.</p>
                <p>Matching Record: {match.documentName}</p>
                <p>Status: {match.status}</p>
              </>
            ) : (
              <p>No matching local evidence record found.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default VerifyPage;
