// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SignSubmitStep from "../../src/pages/NotarizePage/components/SignSubmitStep";

describe("SignSubmitStep", () => {
  afterEach(() => {
    cleanup();
  });

  it("offers a same-page cancel while Pera approval is pending", () => {
    const cancel = vi.fn();

    render(
      <SignSubmitStep
        hasDocument
        walletReady
        transactionPrepared
        processing
        walletApprovalPending
        readyForSignature={false}
        signingMessage="Opening Pera Wallet for transaction approval..."
        submissionMessage=""
        confirmationMessage=""
        signedTransaction={null}
        submissionResult={null}
        confirmationResult={null}
        actionBlocked={false}
        onApproveAndNotarize={vi.fn()}
        onCancelWalletApproval={cancel}
      />
    );

    expect(
      screen.getByRole("button", { name: "Waiting for Pera Wallet..." })
    ).toBeDisabled();
    expect(screen.getByText(/ends automatically after 90 seconds/i)).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Cancel waiting" })
    );

    expect(cancel).toHaveBeenCalledOnce();
  });
});
