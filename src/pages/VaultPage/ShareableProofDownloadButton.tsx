import { useState } from "react";
import type { EvidenceRecord } from "../../services/notarization";
import {
  ShareableVerificationProofService,
} from "../../services/shareable-proof";

type ShareableProofDownloadButtonProps = {
  record: EvidenceRecord;
};

function downloadJsonFile(fileName: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(objectUrl);
}

function ShareableProofDownloadButton({
  record,
}: ShareableProofDownloadButtonProps) {
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  async function handleDownload(): Promise<void> {
    try {
      setBusy(true);
      setMessage("");

      const proof = await ShareableVerificationProofService.create(record);
      const fingerprintPrefix = record.hashValue.slice(0, 12);

      downloadJsonFile(
        `algorand-document-vault-proof-${fingerprintPrefix}.json`,
        proof
      );
      setMessage("Verification proof downloaded.");
    } catch {
      setMessage("The verification proof could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="vault-share-proof">
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleDownload()}
      >
        {busy ? "Creating proof..." : "Download verification proof"}
      </button>
      <small>
        Shareable JSON only—your document and filename are not included.
      </small>
      {message && <span role="status">{message}</span>}
    </div>
  );
}

export default ShareableProofDownloadButton;
