import { useEffect, useState } from "react";
import type { EvidenceRecord } from "../../services/notarization";
import { VerificationLinkService } from "../../services/verification-link";
import { LocalVaultFolderService } from "../../services/vault-folder";
import "./ShareVerificationActions.css";

type ShareVerificationActionsProps = {
  record: EvidenceRecord;
  originalDocument?: File | null;
};

const verificationLinkCache = new Map<string, string>();

function downloadFile(file: File): void {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

async function copyText(value: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function ShareVerificationActions({
  record,
  originalDocument = null,
}: ShareVerificationActionsProps) {
  const cachedVerificationUrl = verificationLinkCache.get(record.id) ?? "";
  const [verificationUrl, setVerificationUrl] = useState(cachedVerificationUrl);
  const [showLink, setShowLink] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [folderMessage, setFolderMessage] = useState<string>("");
  const [busyAction, setBusyAction] = useState<
    "link" | "proof" | "folder" | ""
  >(cachedVerificationUrl ? "" : "link");

  useEffect(() => {
    let active = true;

    if (verificationLinkCache.has(record.id)) {
      return () => {
        active = false;
      };
    }

    void VerificationLinkService.createUrl(record)
      .then((url) => {
        if (!active) return;
        verificationLinkCache.set(record.id, url);
        setVerificationUrl(url);
        setBusyAction("");
      })
      .catch(() => {
        if (!active) return;
        setMessage("The verification link could not be prepared.");
        setBusyAction("");
      });

    return () => {
      active = false;
    };
  }, [record]);

  async function handleCopyLink(): Promise<void> {
    const copied = await copyText(verificationUrl);
    setMessage(
      copied
        ? "Verification link copied. Send it with the original document."
        : "Copy the displayed link manually."
    );
  }

  async function handleShareLink(): Promise<void> {
    if (!verificationUrl || typeof navigator.share !== "function") {
      return;
    }

    try {
      await navigator.share({
        title: `Verify ${record.documentName}`,
        text: "Open this Algorand Document Vault link, then select the accompanying document.",
        url: verificationUrl,
      });
      setMessage("Verification link shared.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setMessage("The share menu could not be opened. Copy the link instead.");
    }
  }

  async function handleDownloadProof(): Promise<void> {
    try {
      setBusyAction("proof");
      const proofFile = await LocalVaultFolderService.createProofFile(record);
      downloadFile(proofFile);
      setMessage("Technical proof JSON downloaded.");
    } catch {
      setMessage("The technical proof JSON could not be created.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleSavePackage(): Promise<void> {
    if (!originalDocument) {
      return;
    }

    try {
      setBusyAction("folder");
      setFolderMessage("");
      const result = await LocalVaultFolderService.savePackage(
        record,
        originalDocument
      );
      setFolderMessage(result.message);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setFolderMessage("Folder selection was cancelled. No files were saved.");
      } else {
        setFolderMessage("The document package could not be saved.");
      }
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="share-verification-actions">
      <div className="share-verification-primary">
        <strong>
          {verificationUrl ? "Verification link ready" : "Preparing verification link..."}
        </strong>
        <p>
          Send the link together with the original document. The document is
          not uploaded or included in the link.
        </p>
        <div className="share-verification-controls">
          <button
            type="button"
            disabled={!verificationUrl || Boolean(busyAction)}
            onClick={() => void handleCopyLink()}
          >
            Copy link
          </button>
          {typeof navigator.share === "function" && (
            <button
              type="button"
              disabled={!verificationUrl || Boolean(busyAction)}
              onClick={() => void handleShareLink()}
            >
              Share link
            </button>
          )}
          <button
            type="button"
            disabled={!verificationUrl}
            onClick={() => setShowLink((currentValue) => !currentValue)}
          >
            {showLink ? "Hide link" : "Show link"}
          </button>
        </div>
      </div>

      {verificationUrl && showLink && (
        <div className="share-verification-link" role="status">
          <label htmlFor={`verification-link-${record.id}`}>
            Verification link
          </label>
          <input
            id={`verification-link-${record.id}`}
            type="text"
            readOnly
            value={verificationUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}

      {message && <p className="share-verification-message" role="status">{message}</p>}

      {originalDocument && (
        <div className="share-verification-folder">
          <button
            type="button"
            disabled={Boolean(busyAction)}
            onClick={() => void handleSavePackage()}
          >
            {busyAction === "folder"
              ? "Saving files..."
              : LocalVaultFolderService.isDirectoryPickerSupported()
                ? "Save document and proof to Vault folder"
                : "Save or share document and proof"}
          </button>
          <p>
            Keeps the original document and its proof together outside the
            browser Vault.
          </p>
          {folderMessage && <p role="status">{folderMessage}</p>}
        </div>
      )}

      <details className="share-verification-advanced">
        <summary>Technical proof JSON</summary>
        <p>
          Use this only when a verification link cannot be shared or for
          technical archiving.
        </p>
        <button
          type="button"
          disabled={Boolean(busyAction)}
          onClick={() => void handleDownloadProof()}
        >
          {busyAction === "proof" ? "Creating JSON..." : "Download proof JSON"}
        </button>
      </details>
    </div>
  );
}

export default ShareVerificationActions;
