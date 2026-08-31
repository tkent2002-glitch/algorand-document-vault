import { useEffect, useState } from "react";
import { AlgorandExplorerService } from "../../services/algorand/AlgorandExplorerService";
import { VerificationLinkService } from "../../services/verification-link";
import {
  ShareableVerificationProofService,
  type ShareableVerificationProofFile,
  type ShareableVerificationProofVerificationResult,
} from "../../services/shareable-proof";

const MAX_SHARED_PROOF_BYTES = 64 * 1024;

type SharedProofVerifierProps = {
  documentHash: string;
  initialProof?: ShareableVerificationProofFile;
  documentLabel?: string;
};

function SharedProofVerifier({
  documentHash,
  initialProof,
  documentLabel,
}: SharedProofVerifierProps) {
  const [fileName, setFileName] = useState("");
  const [linkText, setLinkText] = useState("");
  const [loadedDocumentLabel, setLoadedDocumentLabel] = useState(
    documentLabel ?? ""
  );
  const [linkLoaded, setLinkLoaded] = useState(Boolean(initialProof));
  const [proofValue, setProofValue] = useState<unknown>(initialProof ?? null);
  const [validatedProof, setValidatedProof] =
    useState<ShareableVerificationProofFile | null>(initialProof ?? null);
  const [validationError, setValidationError] = useState("");
  const [verification, setVerification] =
    useState<ShareableVerificationProofVerificationResult | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleLoadLink(): Promise<void> {
    setValidationError("");
    setVerification(null);

    try {
      setProcessing(true);
      const value = linkText.trim();
      const hash = value.startsWith("#")
        ? value
        : new URL(value, window.location.href).hash;
      const result = await VerificationLinkService.parseHash(hash);

      if (!result.valid || !result.envelope) {
        setLinkLoaded(false);
        setValidationError(
          result.errors[0] ?? "The verification link is invalid or incomplete."
        );
        return;
      }

      setProofValue(result.envelope.proof);
      setValidatedProof(result.envelope.proof);
      setLoadedDocumentLabel(result.envelope.documentLabel);
      setLinkLoaded(true);
      setFileName("");
    } catch {
      setLinkLoaded(false);
      setValidationError("Enter a complete Algorand Document Vault verification link.");
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    let active = true;

    if (!proofValue || !validatedProof || !documentHash) {
      void Promise.resolve().then(() => {
        if (active) {
          setVerification(null);
          setProcessing(false);
        }
      });
      return () => {
        active = false;
      };
    }

    void Promise.resolve()
      .then(() => {
        if (active) {
          setVerification(null);
          setProcessing(true);
        }
        return ShareableVerificationProofService.verify(documentHash, proofValue);
      })
      .then((result) => {
        if (active) {
          setVerification(result);
          setProcessing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [documentHash, proofValue, validatedProof]);

  async function handleProofChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = event.target.files?.[0] ?? null;

    setFileName(file?.name ?? "");
    setProofValue(null);
    setValidatedProof(null);
    setVerification(null);
    setValidationError("");

    if (!file) return;
    if (file.size > MAX_SHARED_PROOF_BYTES) {
      setValidationError("The technical proof file is larger than 64 KB.");
      return;
    }

    try {
      setProcessing(true);
      const parsedValue: unknown = JSON.parse(await file.text());
      const validation =
        await ShareableVerificationProofService.validate(parsedValue);

      if (!validation.valid || !validation.proof) {
        setValidationError(
          validation.errors[0] ?? "The technical proof is invalid."
        );
        return;
      }

      setProofValue(parsedValue);
      setValidatedProof(validation.proof);
    } catch {
      setValidationError("The selected file is not a valid JSON proof.");
    } finally {
      setProcessing(false);
    }
  }

  const explorerUrl = validatedProof
    ? AlgorandExplorerService.getTransactionUrl(
        validatedProof.evidence.transactionId
      )
    : null;

  return (
    <div className="shared-proof-verifier">
      {linkLoaded ? (
        <div className="shared-proof-link-loaded" role="status">
          <strong>Verification link loaded</strong>
          <p>
            {loadedDocumentLabel
              ? `Now select “${loadedDocumentLabel}” in Step 1.`
              : "Now select the document from the owner in Step 1."}
          </p>
          <small>
            The displayed name is guidance. The SHA-256 fingerprint is the
            authority.
          </small>
          {!initialProof && (
            <button
              type="button"
              onClick={() => {
                setLinkLoaded(false);
                setLinkText("");
                setProofValue(null);
                setValidatedProof(null);
                setVerification(null);
                setLoadedDocumentLabel("");
              }}
            >
              Use a different verification link
            </button>
          )}
        </div>
      ) : (
        <div className="shared-proof-link-entry">
          <label htmlFor="shared-verification-link">Verification link</label>
          <p>Paste the complete link supplied by the document owner.</p>
          <input
            id="shared-verification-link"
            type="url"
            placeholder="https://…/#verify=…"
            value={linkText}
            onChange={(event) => setLinkText(event.target.value)}
          />
          <button
            type="button"
            disabled={processing || !linkText.trim()}
            onClick={() => void handleLoadLink()}
          >
            {processing ? "Loading link..." : "Load verification link"}
          </button>
        </div>
      )}

      {!linkLoaded && (
        <details className="shared-proof-json-fallback">
          <summary>Advanced: use a technical proof JSON instead</summary>
          <p>
            This fallback is for users who received a proof file rather than a
            verification link.
          </p>
          <label htmlFor="shared-verification-proof">Technical proof file</label>
          <input
            id="shared-verification-proof"
            type="file"
            accept=".json,application/json"
            disabled={processing}
            onChange={(event) => void handleProofChange(event)}
          />
          {fileName && <small>Selected: {fileName}</small>}
        </details>
      )}

      {validationError && (
        <div className="verify-final-result failed" role="alert">
          <strong>Technical proof rejected</strong>
          <p>{validationError}</p>
        </div>
      )}

      <div className="shared-proof-result-step">
        <span className="verify-step-label">Step 3</span>
        <h3>Review result</h3>

        {!validatedProof && !validationError && (
          <div className="verify-final-result ready">
            <strong>Waiting for shared evidence</strong>
            <p>Open a verification link or add a technical proof JSON above.</p>
          </div>
        )}
        {validatedProof && !documentHash && (
          <div className="verify-final-result ready" role="status">
            <strong>Shared evidence is ready</strong>
            <p>Select the document in Step 1 to compare fingerprints.</p>
          </div>
        )}
        {processing && <p role="status">Checking the shared verification...</p>}
        {verification && (
          <div
            className={`verify-final-result ${verification.verified ? "verified" : "failed"}`}
            role="status"
          >
            <strong>
              {verification.verified
                ? "Public verification confirmed"
                : "Public verification not confirmed"}
            </strong>
            <p>{verification.message}</p>
            {verification.errors.length > 0 && (
              <p>{verification.errors.join(" ")}</p>
            )}
            {verification.verified && validatedProof && (
              <dl>
                <div>
                  <dt>Confirmed round</dt>
                  <dd>{validatedProof.evidence.confirmedRound}</dd>
                </div>
                <div>
                  <dt>Transaction</dt>
                  <dd><code>{validatedProof.evidence.transactionId}</code></dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </div>

      {explorerUrl && (
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          View verification transaction on Pera Explorer
        </a>
      )}

      <details className="shared-proof-boundary">
        <summary>Shared verification boundary</summary>
        <p>
          The link or proof contains a fingerprint and public TestNet receipt
          metadata, not the original document, a wallet address, or a local
          Vault record ID. The document is never uploaded.
        </p>
      </details>
    </div>
  );
}

export default SharedProofVerifier;
