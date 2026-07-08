import { describe, expect, it } from "vitest";
import { EvidenceBackupValidationService } from "../../src/services/backup/EvidenceBackupValidationService";

const validRecord = {
  id: "record-1",
  status: "draft",
  documentName: "test.txt",
  hashAlgorithm: "SHA-256",
  hashValue: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  proof: {
    id: "proof-1",
    status: "created",
    payload: {
      schemaVersion: "1.0",
      hash: {
        algorithm: "SHA-256",
        value: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      },
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
};

describe("EvidenceBackupValidationService", () => {
  it("accepts a valid evidence backup", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [validRecord],
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects an unsupported schema", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "bad-schema",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [validRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Unsupported backup schema.");
  });

  it("rejects an invalid SHA-256 hash", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [
        {
          ...validRecord,
          hashValue: "not-a-valid-hash",
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has invalid SHA-256 hash.");
  });

  it("rejects mismatched record counts", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 2,
      records: [validRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Backup recordCount does not match records length.");
  });
});
