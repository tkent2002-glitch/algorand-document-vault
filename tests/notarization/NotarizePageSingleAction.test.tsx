// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotarizationWorkflow } from "../../src/core";
import NotarizePage from "../../src/pages/NotarizePage/NotarizePage";
import { AlgorandNotarizationLifecycleService } from "../../src/services/algorand/AlgorandNotarizationLifecycleService";
import {
  AlgorandProofTransactionDraftService,
  AlgorandTestNetPreflightService,
  AlgorandTransactionSigningService,
  WalletService,
} from "../../src/services";
import type { EvidenceRecord } from "../../src/services";
import type {
  AlgorandSignedProofTransaction,
  NotarizationProof,
} from "../../src/types";

vi.mock("@perawallet/connect", () => ({
  PeraWalletConnect: class {},
}));

describe("NotarizePage single-action transaction flow", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("signs, submits, and confirms from one user action", async () => {
    const proof: NotarizationProof = {
      payload: {
        appId: "algorand-document-vault",
        schemaVersion: "1.0",
        hash: {
          algorithm: "SHA-256",
          value:
            "31fe0157829c40498154546999ceef51c7b0cfcc296c7d659e7337452eb333d0",
        },
      },
      status: "draft",
      createdAt: "2026-08-29T01:00:00.000Z",
    };

    const evidenceRecord: EvidenceRecord = {
      id: "3e9d4e45-c010-41d1-8be6-9d4e1ed9cab7",
      status: "draft",
      documentName: "contract.pdf",
      hashAlgorithm: "SHA-256",
      hashValue: proof.payload.hash.value,
      proof,
      createdAt: "2026-08-29T01:00:00.000Z",
    };

    const signedTransaction: AlgorandSignedProofTransaction = {
      txId: "TESTNET_TRANSACTION_ID",
      signedTransaction: new Uint8Array([1, 2, 3]),
      signedTransactionByteLength: 3,
      signedAt: "2026-08-29T01:01:00.000Z",
    };

    vi.spyOn(WalletService, "reconnect").mockResolvedValue({
      status: "connected",
      address:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
    });
    vi.spyOn(NotarizationWorkflow, "execute").mockResolvedValue({
      fileName: "contract.pdf",
      hashValue: proof.payload.hash.value,
      proof,
      evidenceRecord,
      duplicateRecord: null,
      serializedProofPayload: JSON.stringify({
        schema: "adv-proof-v1",
        proofType: "document-fingerprint",
        hashAlgorithm: "SHA-256",
        hash: proof.payload.hash.value,
      }),
      errors: [],
    });
    vi.spyOn(
      AlgorandProofTransactionDraftService,
      "createDraft"
    ).mockReturnValue({
      senderAddress:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
      receiverAddress:
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
      notePreview: JSON.stringify(proof.payload),
      noteByteLength: 128,
      minimumFeeMicroAlgos: 1000,
    });
    vi.spyOn(
      AlgorandTestNetPreflightService,
      "evaluate"
    ).mockResolvedValue({
      ready: true,
      checks: [],
      errors: [],
    });
    const sign = vi
      .spyOn(
        AlgorandTransactionSigningService,
        "signProofTransaction"
      )
      .mockResolvedValue(signedTransaction);
    const complete = vi
      .spyOn(AlgorandNotarizationLifecycleService, "complete")
      .mockResolvedValue({
        submissionResult: {
          transactionId: signedTransaction.txId,
          submittedAt: "2026-08-29T01:02:00.000Z",
        },
        confirmationResult: {
          transactionId: signedTransaction.txId,
          confirmedRound: 66769209,
          confirmedAt: "2026-08-29T01:03:00.000Z",
        },
        confirmedRecord: {
          ...evidenceRecord,
          status: "confirmed",
          algorandTransactionId: signedTransaction.txId,
          confirmedRound: 66769209,
          confirmedAt: "2026-08-29T01:03:00.000Z",
        },
      });

    render(<NotarizePage />);

    await waitFor(() =>
      expect(screen.getByText("Wallet connected")).toBeVisible()
    );

    fireEvent.change(
      screen.getByLabelText("Document to notarize"),
      {
        target: {
          files: [
            new File(["contract"], "contract.pdf", {
              type: "application/pdf",
            }),
          ],
        },
      }
    );

    const action = await screen.findByRole("button", {
      name: "Approve and notarize",
    });

    await waitFor(() => expect(action).toBeEnabled());
    const actionPanel = screen
      .getByText("One secure action")
      .closest(".notarize-action-step");
    const selectedFile = screen.getByText("Selected File:");

    expect(actionPanel).not.toBeNull();
    expect(
      (actionPanel?.compareDocumentPosition(selectedFile) ?? 0) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Sign with Pera Wallet" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Submit to Algorand TestNet",
      })
    ).not.toBeInTheDocument();

    fireEvent.click(action);

    await waitFor(() => expect(complete).toHaveBeenCalledOnce());

    expect(sign).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({
        signedTransaction,
        evidenceRecord,
      })
    );
    expect(sign.mock.invocationCallOrder[0]).toBeLessThan(
      complete.mock.invocationCallOrder[0]
    );
    expect(
      await screen.findByText("Notarization complete")
    ).toBeVisible();
  });
});
