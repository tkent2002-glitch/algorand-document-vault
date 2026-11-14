// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SharedProofVerifier from "../../src/pages/VerifyPage/SharedProofVerifier";
import {
  ShareableVerificationProofService,
  type ShareableVerificationProofFile,
} from "../../src/services/shareable-proof";
import { VerificationLinkService } from "../../src/services/verification-link";

const HASH =
  "0a69773de57196532ae089e3f221bdc5261930a71ee90d8f63c5df4691f04134";
const TRANSACTION_ID =
  "YPM7SPY7J76DMS5E7NJT3BD4MMTWXAUT6ZNND2APLCHMD275BCQA";
const PROOF: ShareableVerificationProofFile = {
  schema: "adv-shareable-verification-proof-v1",
  network: "algorand-testnet",
  exportedAt: "2026-08-30T20:27:16.955Z",
  evidence: {
    hashAlgorithm: "SHA-256",
    hashValue: HASH,
    transactionId: TRANSACTION_ID,
    confirmedRound: 66826566,
  },
  integrity: {
    algorithm: "SHA-256",
    digest: "1".repeat(64),
  },
};

function createProofFile(): File {
  const file = new File([JSON.stringify(PROOF)], "shared-proof.json", {
    type: "application/json",
  });

  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(JSON.stringify(PROOF)),
  });

  return file;
}

describe("SharedProofVerifier", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("accepts a valid proof and asks for a document when none is selected", async () => {
    vi.spyOn(ShareableVerificationProofService, "validate").mockResolvedValue({
      valid: true,
      proof: PROOF,
      errors: [],
    });
    const verify = vi.spyOn(ShareableVerificationProofService, "verify");

    render(<SharedProofVerifier documentHash="" />);

    fireEvent.change(
      screen.getByLabelText("Technical proof file"),
      { target: { files: [createProofFile()] } }
    );

    expect(await screen.findByText("Shared evidence is ready")).toBeVisible();
    expect(
      screen.getByText("Select the document in Step 1 to compare fingerprints.")
    ).toBeVisible();
    expect(verify).not.toHaveBeenCalled();
  });

  it("shows a public verification receipt after the document and chain match", async () => {
    vi.spyOn(ShareableVerificationProofService, "validate").mockResolvedValue({
      valid: true,
      proof: PROOF,
      errors: [],
    });
    vi.spyOn(ShareableVerificationProofService, "verify").mockResolvedValue({
      verified: true,
      status: "verified",
      message:
        "The document and shared proof are confirmed on Algorand TestNet.",
      errors: [],
      proof: PROOF,
    });

    render(<SharedProofVerifier documentHash={HASH} />);

    fireEvent.change(
      screen.getByLabelText("Technical proof file"),
      { target: { files: [createProofFile()] } }
    );

    expect(await screen.findByText("Public verification confirmed")).toBeVisible();
    expect(screen.getByText("66826566")).toBeVisible();
    expect(screen.getByText(TRANSACTION_ID)).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: "View verification transaction on Pera Explorer",
      })
    ).toHaveAttribute(
      "href",
      `https://testnet.explorer.perawallet.app/tx/${TRANSACTION_ID}`
    );

    await waitFor(() => {
      expect(
        ShareableVerificationProofService.verify
      ).toHaveBeenCalledWith(HASH, PROOF);
    });
  });

  it("shows a clear rejection for malformed proof JSON", async () => {
    const file = new File(["not-json"], "invalid.json", {
      type: "application/json",
    });

    Object.defineProperty(file, "text", {
      value: vi.fn().mockResolvedValue("not-json"),
    });

    render(<SharedProofVerifier documentHash={HASH} />);

    fireEvent.change(
      screen.getByLabelText("Technical proof file"),
      { target: { files: [file] } }
    );

    expect(
      await screen.findByText("The selected file is not a valid JSON proof.")
    ).toBeVisible();
  });

  it("loads a pasted verification link without requiring JSON", async () => {
    vi.spyOn(VerificationLinkService, "parseHash").mockResolvedValue({
      valid: true,
      envelope: {
        version: "adv-verification-link-v1",
        documentLabel: "test 6 link test.txt",
        proof: PROOF,
      },
      errors: [],
    });

    render(<SharedProofVerifier documentHash="" />);

    fireEvent.change(screen.getByLabelText("Verification link"), {
      target: { value: "https://vault.example/#verify=proof" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load verification link" }));

    expect(await screen.findByText("Verification link loaded")).toBeVisible();
    expect(
      screen.getByText("Now select “test 6 link test.txt” in Step 1.")
    ).toBeVisible();
    expect(screen.queryByLabelText("Technical proof file")).not.toBeInTheDocument();
    expect(VerificationLinkService.parseHash).toHaveBeenCalledWith("#verify=proof");
  });
});
