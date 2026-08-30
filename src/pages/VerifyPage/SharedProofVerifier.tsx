import { useEffect, useState } from "react";
import { AlgorandExplorerService } from "../../services/algorand/AlgorandExplorerService";
import {
  ShareableVerificationProofService,
  type ShareableVerificationProofFile,
  type ShareableVerificationProofVerificationResult,
} from "../../services/shareable-proof";

const MAX_SHARED_PROOF_BYTES = 64 * 1024;

type SharedProofVerifierProps = {
  documentHash: string;
};

function SharedProofVerifier({ documentHash }: SharedProofVerifierProps) {
  const [fileName, setFileName] = useState<string>("");
  const [proofValue, setProofValue] = useState<unknown>(null);
  const [validatedProof, setValidatedProof] =
    useState<ShareableVerificationProofFile | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [verification, setVerification] =
    useState<ShareableVerificationProofVerificationResult | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

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

        return ShareableVerificationProofService.verify(
          documentHash,
          proofValue
        );
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

    if (!file) {
      return;
    }

    if (file.size > MAX_SHARED_PROOF_BYTES) {
      setValidationError("The shared proof file is larger than 64 KB.");
      return;
    }

    try {
      setProcessing(true);
      const parsedValue: unknown = JSON.parse(await file.text());
      const validation =
        await ShareableVerificationProofService.validate(parsedValue);

      if (!validation.valid || !validation.proof) {
        setValidationError(
          validation.errors[0] ?? "The shared proof is invalid."
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
  const resultClass = verification?.verified
    ? "shared-proof-result verified"
    : verification
      ? "shared-proof-result failed"
      : "shared-proof-result";

  return (
    <section className="shared-proof-verifier" aria-labelledby="shared-proof-title">
      <div className="shared-proof-heading">
        <div>
          <span className="verify-step-label">Optional public proof</span>
          <h3 id="shared-proof-title">Verify with a shared proof</h3>
        </div>
        <span>Algorand TestNet</span>
      </div>

      <p>
        Select a proof JSON from the document owner. The document is hashed on
        this device and is never uploaded.
      </p>

      <label htmlFor="shared-verification-proof">Shared proof file</label>
      <input
        id="shared-verification-proof"
        type="file"
        accept=".json,application/json"
        disabled={processing}
        onChange={(event) => void handleProofChange(event)}
      />

      {fileName && <small>Selected: {fileName}</small>}

      {validationError && (
        <div className="shared-proof-result failed" role="alert">
          <strong>Proof file rejected</strong>
          <p>{validationError}</p>
        </div>
      )}

      {validatedProof && !documentHash && (
        <div className="shared-proof-result ready" role="status">
          <strong>Proof file accepted</strong>
          <p>Select the document above to complete public verification.</p>
        </div>
      )}

      {processing && <p role="status">Checking the shared proof...</p>}

      {verification && (
        <div className={resultClass} role="status">
          <strong>
            {verification.verified
              ? "Shared proof verified"
              : "Shared proof not verified"}
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
                <dd>
                  <code>{validatedProof.evidence.transactionId}</code>
                </dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {explorerUrl && (
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          View proof transaction on Pera Explorer
        </a>
      )}

      <details>
        <summary>Shared proof boundary</summary>
        <p>
          The file contains a fingerprint and public TestNet receipt metadata,
          not the original document, its filename, a wallet address, or a local
          Vault record ID. Its integrity digest detects changes but is not an
          author signature; the on-chain transaction check is the public anchor.
        </p>
      </details>
    </section>
  );
}

export default SharedProofVerifier;
