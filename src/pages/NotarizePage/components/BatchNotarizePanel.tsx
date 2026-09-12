import { useEffect, useMemo, useRef, useState } from "react";
import { MerkleBatchNotarizationWorkflow } from "../../../core";
import { BatchEvidenceRepository } from "../../../repositories/evidence/BatchEvidenceRepository";
import {
  AlgorandBatchNotarizationLifecycleService,
  AlgorandExplorerService,
  AlgorandProofTransactionDraftService,
  AlgorandTestNetPreflightService,
  AlgorandTransactionSigningService,
  WalletService,
  type BatchEvidenceDraft,
  type BatchHashingProgress,
} from "../../../services";
import { AlgorandNotarizationLifecycleError } from "../../../services/algorand/AlgorandNotarizationLifecycleService";
import { TransactionFailureClassificationService } from "../../../services/algorand/TransactionFailureClassificationService";
import { TransactionRecoveryDecisionService } from "../../../services/algorand/TransactionRecoveryDecisionService";
import type {
  AlgorandConfirmationResult,
  MerkleBatchProof,
} from "../../../types";
import type { WalletConnection } from "../../../types/wallet";

type BatchNotarizePanelProps = {
  onCompletionChange?: (complete: boolean) => void;
};

export default function BatchNotarizePanel({
  onCompletionChange,
}: BatchNotarizePanelProps) {
  const [wallet, setWallet] = useState<WalletConnection>({ status: "disconnected" });
  const [files, setFiles] = useState<File[]>([]);
  const [evidence, setEvidence] = useState<BatchEvidenceDraft | null>(null);
  const [proof, setProof] = useState<MerkleBatchProof | null>(null);
  const [progress, setProgress] = useState<BatchHashingProgress | null>(null);
  const [message, setMessage] = useState("Select two or more documents to begin.");
  const [busy, setBusy] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const [confirmation, setConfirmation] = useState<AlgorandConfirmationResult | null>(null);
  const [recoveryTransactionId, setRecoveryTransactionId] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    void WalletService.reconnect().then((result) => active && setWallet(result));
    return () => {
      active = false;
      abortController.current?.abort();
    };
  }, []);

  useEffect(() => {
    onCompletionChange?.(Boolean(confirmation));
  }, [confirmation, onCompletionChange]);

  const draft = useMemo(
    () =>
      wallet.address && proof
        ? AlgorandProofTransactionDraftService.createDraft(proof, wallet.address)
        : null,
    [proof, wallet.address]
  );

  async function prepare(selected: File[]) {
    setFiles(selected);
    setEvidence(null);
    setProof(null);
    setConfirmation(null);
    setRecoveryTransactionId(null);
    if (selected.length < 2) {
      setMessage("Choose at least two documents for a Merkle batch.");
      return;
    }

    try {
      setBusy(true);
      setMessage("Hashing documents locally...");
      const result = await MerkleBatchNotarizationWorkflow.execute(selected, {
        onProgress: setProgress,
      });
      setEvidence(result.evidence);
      setProof(result.proof);
      setMessage("Batch prepared. Review the root and approve one TestNet transaction.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Batch preparation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function connectWallet() {
    const result = await WalletService.connect();
    setWallet(result);
  }

  async function notarize() {
    if (!proof || !evidence || !wallet.address) return;
    try {
      setBusy(true);
      setRecoveryTransactionId(null);
      const preflight = await AlgorandTestNetPreflightService.evaluate();
      if (!preflight.ready) {
        setMessage(preflight.errors.join(" ") || "Algorand TestNet is not ready.");
        return;
      }
      setMessage("Opening Pera Wallet for one batch-anchor approval...");
      const controller = new AbortController();
      abortController.current = controller;
      setApprovalPending(true);
      const signed = await AlgorandTransactionSigningService.signProofTransaction(
        proof,
        wallet.address,
        { signal: controller.signal }
      );
      setApprovalPending(false);
      abortController.current = null;
      setMessage("Wallet approval complete. Submitting the validated batch anchor...");
      const result = await AlgorandBatchNotarizationLifecycleService.complete({
        signedTransaction: signed,
        batchRecord: evidence.batch,
        expectedSenderAddress: wallet.address,
        onProgress: ({ message: nextMessage }) => setMessage(nextMessage),
      });
      setEvidence({ ...evidence, batch: result.confirmedRecord });
      setConfirmation(result.confirmationResult);
    } catch (error) {
      const transactionId =
        error instanceof AlgorandNotarizationLifecycleError
          ? error.transactionId
          : null;
      setRecoveryTransactionId(transactionId);
      const source =
        error instanceof AlgorandNotarizationLifecycleError
          ? error.causeValue
          : error;
      setMessage(
        TransactionFailureClassificationService.classify(source, {
          stage: transactionId ? "confirming" : "signing",
        }).userMessage
      );
    } finally {
      abortController.current = null;
      setApprovalPending(false);
      setBusy(false);
    }
  }

  async function recover() {
    if (!recoveryTransactionId || !proof || !wallet.address || !evidence) return;
    setBusy(true);
    const failure = TransactionFailureClassificationService.classify(
      new Error("Transaction confirmation status is uncertain."),
      { stage: "confirming" }
    );
    const result = await TransactionRecoveryDecisionService.evaluate({
      failure,
      transactionId: recoveryTransactionId,
      proof,
      expectedSenderAddress: wallet.address,
    });
    setMessage(result.userMessage);
    if (result.decision === "confirmed" && result.statusResult?.confirmedRound) {
      const confirmedAt = new Date().toISOString();
      const recovered = {
        ...evidence.batch,
        status: "confirmed" as const,
        algorandTransactionId: recoveryTransactionId,
        confirmedRound: result.statusResult.confirmedRound,
        confirmedAt,
      };
      await BatchEvidenceRepository.updateBatchAsync(recovered);
      setEvidence({ ...evidence, batch: recovered });
      setConfirmation({
        transactionId: recoveryTransactionId,
        confirmedRound: result.statusResult.confirmedRound,
        confirmedAt,
      });
      setRecoveryTransactionId(null);
    }
    setBusy(false);
  }

  return (
    <div className="batch-notarize-panel">
      <section className="notarize-section">
        <p className="notarize-eyebrow">Step 1 · Select a batch</p>
        <h3>Choose 2–1,000 documents</h3>
        <p>Each file is fingerprinted locally. Original files are never uploaded.</p>
        <p id="batch-file-picker-help" className="batch-file-picker-help">
          Select all documents in the same window. On Windows, hold Ctrl to choose
          individual files or Shift to choose a range.
        </p>
        <input
          type="file"
          multiple
          disabled={busy}
          aria-label="Documents to notarize as one Merkle batch"
          aria-describedby="batch-file-picker-help"
          onChange={(event) => void prepare(Array.from(event.target.files ?? []))}
        />
        {progress && busy && (
          <p role="status">
            Hashed {progress.completedFiles} of {progress.totalFiles} documents
          </p>
        )}
      </section>

      <section className="notarize-section">
        <p className="notarize-eyebrow">Step 2 · Review and connect</p>
        <h3>{files.length.toLocaleString()} documents selected</h3>
        {evidence ? (
          <dl className="batch-summary">
            <div><dt>Merkle root</dt><dd><code>{evidence.batch.merkleRoot}</code></dd></div>
            <div><dt>Members</dt><dd>{evidence.batch.leafCount}</dd></div>
            <div><dt>On-chain transactions</dt><dd>1</dd></div>
          </dl>
        ) : <p>The Merkle root appears after local hashing finishes.</p>}
        {wallet.status !== "connected" ? (
          <button type="button" onClick={() => void connectWallet()} disabled={busy}>
            Connect Pera Wallet
          </button>
        ) : <p>Wallet ready: <code>{wallet.address}</code></p>}
      </section>

      <section className="notarize-section">
        <p className="notarize-eyebrow">Step 3 · Anchor the batch</p>
        <p role="status">{message}</p>
        {!confirmation && (
          <>
            <button
              type="button"
              onClick={() => void notarize()}
              disabled={busy || !draft || !evidence}
            >
              {busy ? "Working..." : "Approve and notarize batch"}
            </button>
            {approvalPending && (
              <button
                type="button"
                onClick={() => abortController.current?.abort()}
              >
                Cancel wallet request
              </button>
            )}
          </>
        )}
        {recoveryTransactionId && (
          <button type="button" onClick={() => void recover()} disabled={busy}>
            Check transaction status
          </button>
        )}
        {confirmation && (
          <div className="verify-final-result verified">
            <strong>Merkle batch confirmed</strong>
            <p>All {evidence?.batch.leafCount} membership proofs reference this one confirmed anchor.</p>
            <a
              href={AlgorandExplorerService.getTransactionUrl(confirmation.transactionId)}
              target="_blank"
              rel="noreferrer"
            >
              View batch transaction on Pera Explorer
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
