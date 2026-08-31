import { afterEach, describe, expect, it, vi } from "vitest";
import type { EvidenceRecord } from "../../src/services/notarization";
import {
  ShareableVerificationProofService,
  type ShareableVerificationProofFile,
} from "../../src/services/shareable-proof";
import { VerificationLinkService } from "../../src/services/verification-link";

const PROOF = {
  schema: "adv-shareable-verification-proof-v1",
  network: "algorand-testnet",
  exportedAt: "2026-08-30T20:27:16.955Z",
  evidence: {
    hashAlgorithm: "SHA-256",
    hashValue: "0".repeat(64),
    transactionId: "A".repeat(52),
    confirmedRound: 66826566,
  },
  integrity: { algorithm: "SHA-256", digest: "1".repeat(64) },
} as ShareableVerificationProofFile;

const RECORD = {
  id: "record-1",
  status: "confirmed",
  documentName: "signed agreement.pdf",
} as EvidenceRecord;

describe("VerificationLinkService", () => {
  afterEach(() => vi.restoreAllMocks());

  it("creates a fragment link and restores the document guidance and proof", async () => {
    vi.spyOn(ShareableVerificationProofService, "create").mockResolvedValue(PROOF);
    vi.spyOn(ShareableVerificationProofService, "validate").mockResolvedValue({
      valid: true,
      proof: PROOF,
      errors: [],
    });

    const url = await VerificationLinkService.createUrl(
      RECORD,
      "https://vault.example/verify?private=query#old"
    );
    const parsedUrl = new URL(url);
    const result = await VerificationLinkService.parseHash(parsedUrl.hash);

    expect(parsedUrl.origin).toBe("https://vault.example");
    expect(parsedUrl.pathname).toBe("/");
    expect(parsedUrl.search).toBe("");
    expect(parsedUrl.hash).toMatch(/^#verify=/);
    expect(result.valid).toBe(true);
    expect(result.envelope?.documentLabel).toBe("signed agreement.pdf");
    expect(result.envelope?.proof).toEqual(PROOF);
  });

  it("rejects an invalid or altered link payload", async () => {
    const result = await VerificationLinkService.parseHash("#verify=not-base64-json");

    expect(result.valid).toBe(false);
    expect(result.envelope).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
