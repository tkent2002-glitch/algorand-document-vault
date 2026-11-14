import { describe, expect, it } from "vitest";
import { EvidenceBackupValidationService } from "../../src/services/backup/EvidenceBackupValidationService";
import { INPUT_SECURITY_LIMITS } from "../../src/services/security/InputSecurityLimits";

const validRecord = {
  id: "record-1",
  status: "draft",
  documentName: "test.txt",
  hashAlgorithm: "SHA-256",
  hashValue: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
  proof: {
    id: "proof-1",
    status: "draft",
    payload: {
      appId: "algorand-document-vault",
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

  it("rejects a proof hash that does not match the evidence record hash", () => {
    const mismatchedRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        payload: {
          ...validRecord.proof.payload,
          hash: {
            ...validRecord.proof.payload.hash,
            value: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          },
        },
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [mismatchedRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 proof hash does not match record hash.");
  });

  it("rejects a proof created for a different application", () => {
    const invalidRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        payload: {
          ...validRecord.proof.payload,
          appId: "different-application",
        },
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has invalid proof application id.");
  });

  it("rejects an unsupported proof schema version", () => {
    const invalidRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        payload: {
          ...validRecord.proof.payload,
          schemaVersion: "9.9",
        },
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has unsupported proof schema version.");
  });

  it("rejects an unsupported proof hash algorithm", () => {
    const invalidRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        payload: {
          ...validRecord.proof.payload,
          hash: {
            ...validRecord.proof.payload.hash,
            algorithm: "SHA-1",
          },
        },
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has unsupported proof hash algorithm.");
  });

  it("rejects a confirmed record without confirmation metadata", () => {
    const invalidRecord = {
      ...validRecord,
      status: "confirmed",
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 confirmed evidence is missing confirmation metadata.");
  });

  it("rejects a submitted record without submission metadata", () => {
    const invalidRecord = {
      ...validRecord,
      status: "submitted",
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 submitted evidence is missing submission metadata.");
  });

  it("rejects an unsupported evidence record status", () => {
    const invalidRecord = {
      ...validRecord,
      status: "verified",
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has unsupported status.");
  });

  it("rejects an unsupported proof status", () => {
    const invalidRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        status: "verified",
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has unsupported proof status.");
  });

  it("rejects an invalid proof createdAt timestamp", () => {
    const invalidRecord = {
      ...validRecord,
      proof: {
        ...validRecord.proof,
        createdAt: "not-a-date",
      },
    };

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [invalidRecord],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 has invalid proof createdAt timestamp.");
  });

  it("rejects non-object records without throwing", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 2,
      records: [null, "record"],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Record 0 must be a JSON object.");
    expect(result.errors).toContain("Record 1 must be a JSON object.");
  });

  it("rejects unsafe record counts", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: Number.MAX_VALUE,
      records: [],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Backup recordCount must be a non-negative safe integer."
    );
  });

  it("rejects backups above the record resource limit", () => {
    const records = Array.from(
      { length: INPUT_SECURITY_LIMITS.backupRecords + 1 },
      () => validRecord
    );
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      `Backup contains more than ${INPUT_SECURITY_LIMITS.backupRecords.toLocaleString()} records.`
    );
  });

  it("rejects malformed integrity metadata", () => {
    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 1,
      records: [validRecord],
      integrity: { algorithm: "SHA-256", digest: "not-a-digest" },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Backup integrity metadata is invalid.");
  });

  it("rejects deeply nested backup JSON before integrity processing", () => {
    let nested: unknown = "leaf";
    for (let index = 0; index <= INPUT_SECURITY_LIMITS.jsonNestingDepth; index += 1) {
      nested = { nested };
    }

    const result = EvidenceBackupValidationService.validate({
      schema: "adv-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      recordCount: 0,
      records: [],
      unexpected: nested,
    });

    expect(result).toEqual({
      valid: false,
      errors: ["Backup JSON exceeds structural complexity limits."],
    });
  });
});
