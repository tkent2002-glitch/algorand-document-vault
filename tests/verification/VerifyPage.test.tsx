// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
      screen.getByText("Now select “test 8 link test.txt” in Step 1.")
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Local verification" }));
    expect(screen.getByText("Verification link loaded")).not.toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Shared verification" }));
    expect(screen.getByText("Verification link loaded")).toBeVisible();
    expect(screen.queryByLabelText("Verification link")).not.toBeInTheDocument();
    expect(parseHash).toHaveBeenCalledTimes(1);
  });
});
