import { describe, expect, it } from "vitest";
import { VerificationService } from "../../src/services/verification/VerificationService";
import type { DocumentHash } from "../../src/types";

describe("VerificationService", () => {
  it("returns hash_match when document hashes match", () => {
    const hash: DocumentHash = {
      algorithm: "SHA-256",
      value: "abc123",
    };

    const result = VerificationService.compareHashes(hash, hash);

    expect(result.status).toBe("hash_match");
  });

  it("returns hash_mismatch when document hashes do not match", () => {
    const expected: DocumentHash = {
      algorithm: "SHA-256",
      value: "abc123",
    };

    const actual: DocumentHash = {
      algorithm: "SHA-256",
      value: "different",
    };

    const result = VerificationService.compareHashes(expected, actual);

    expect(result.status).toBe("hash_mismatch");
  });
});
