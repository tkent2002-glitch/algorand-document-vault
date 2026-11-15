// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HashService } from "../../src/services";
import { EvidenceRepository } from "../../src/repositories";
import { BatchEvidenceRepository } from "../../src/repositories/evidence/BatchEvidenceRepository";
import { ShareableVerificationProofService } from "../../src/services/shareable-proof";
import VerifyPage from "../../src/pages/VerifyPage/VerifyPage";
import type { ShareableVerificationProofFile } from "../../src/services/shareable-proof";
import { VerificationLinkService } from "../../src/services/verification-link";

vi.mock("../../src/services", () => ({
  HashService: {
    sha256FromFile: vi.fn(),
  },
  VerificationLinkService: {
    hasVerificationHash: vi.fn(() => false),
    parseHash: vi.fn(),
  },
}));

const PROOF: ShareableVerificationProofFile = {
  schema: "adv-shareable-verification-proof-v1",
  network: "algorand-testnet",
  exportedAt: "2026-08-30T20:27:16.955Z",
  evidence: {
    hashAlgorithm: "SHA-256",
    hashValue:
      "0a69773de57196532ae089e3f221bdc5261930a71ee90d8f63c5df4691f04134",
    transactionId:
      "YPM7SPY7J76DMS5E7NJT3BD4MMTWXAUT6ZNND2APLCHMD275BCQA",
    confirmedRound: 66826566,
  },
  integrity: {
    algorithm: "SHA-256",
    digest: "1".repeat(64),
  },
};

describe("VerifyPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("retains a loaded verification link while switching verification sources", async () => {
    window.history.replaceState(null, "", "/");
    const parseHash = vi
      .spyOn(VerificationLinkService, "parseHash")
      .mockResolvedValue({
        valid: true,
        envelope: {
          version: "adv-verification-link-v1",
          documentLabel: "test 8 link test.txt",
          proof: PROOF,
        },
        errors: [],
      });

    render(<VerifyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Shared verification" }));
    fireEvent.change(screen.getByLabelText("Verification link"), {
      target: { value: "https://vault.example/#verify=test-eight" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load verification link" }));

    expect(await screen.findByText("Verification link loaded")).toBeVisible();
    expect(
      screen.getByText("Expected document from proof: “test 8 link test.txt”.")
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Local verification" }));
    expect(screen.getByText("Verification link loaded")).not.toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Shared verification" }));
    expect(screen.getByText("Verification link loaded")).toBeVisible();
    expect(screen.queryByLabelText("Verification link")).not.toBeInTheDocument();
    expect(parseHash).toHaveBeenCalledTimes(1);
  });
  it("keeps the selected filename distinct from the proof label when files change", async () => {
    vi.spyOn(EvidenceRepository, "listAsync").mockResolvedValue([]);
    vi.spyOn(BatchEvidenceRepository, "findMembersByHashAsync").mockResolvedValue([]);
    vi.mocked(HashService.sha256FromFile).mockResolvedValue("a".repeat(64));
    vi.spyOn(ShareableVerificationProofService, "verify").mockResolvedValue({
      verified: false,
      status: "document_mismatch",
      message: "The selected document does not match the shared proof fingerprint.",
      errors: [],
    });
    vi.spyOn(VerificationLinkService, "parseHash").mockResolvedValue({
      valid: true,
      envelope: {
        version: "adv-verification-link-v1",
        documentLabel: "original.txt",
        proof: PROOF,
      },
      errors: [],
    });
    render(<VerifyPage />);
    fireEvent.click(screen.getByRole("button", { name: "Shared verification" }));
    fireEvent.change(screen.getByLabelText("Verification link"), {
      target: { value: "https://vault.example/#verify=filename-test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load verification link" }));
    expect(await screen.findByText("Expected document from proof: “original.txt”.")).toBeVisible();
    for (const name of ["modified.txt", "another-copy.txt"]) {
      fireEvent.change(screen.getByLabelText("Document to verify"), {
        target: { files: [new File(["changed"], name)] },
      });
      expect(await screen.findByRole("heading", { name: `Selected document: ${name}` })).toBeVisible();
      expect(await screen.findByText("Public verification not confirmed")).toBeVisible();
      expect(screen.getByText("Expected document from proof: “original.txt”.")).toBeVisible();
    }
  });

});
