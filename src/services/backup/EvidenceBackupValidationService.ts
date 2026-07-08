import type { EvidenceRecord } from "../notarization";

export type EvidenceBackupFile = {
  schema: "adv-evidence-backup-v1";
  exportedAt: string;
  recordCount: number;
  records: EvidenceRecord[];
};

export type EvidenceBackupValidationResult = {
  valid: boolean;
  errors: string[];
};

function isSha256(value: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(value);
}

function isIsoDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export class EvidenceBackupValidationService {
  static validate(data: unknown): EvidenceBackupValidationResult {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      return {
        valid: false,
        errors: ["Backup file must be a JSON object."],
      };
    }

    const backup = data as EvidenceBackupFile;

    if (backup.schema !== "adv-evidence-backup-v1") {
      errors.push("Unsupported backup schema.");
    }

    if (!backup.exportedAt || !isIsoDate(backup.exportedAt)) {
      errors.push("Backup exportedAt timestamp is missing or invalid.");
    }

    if (!Array.isArray(backup.records)) {
      errors.push("Backup records must be an array.");
    }

    if (typeof backup.recordCount !== "number") {
      errors.push("Backup recordCount must be a number.");
    }

    if (Array.isArray(backup.records) && backup.recordCount !== backup.records.length) {
      errors.push("Backup recordCount does not match records length.");
    }

    if (Array.isArray(backup.records)) {
      const recordIds = new Set<string>();

      backup.records.forEach((record, index) => {
        if (!record.id) {
          errors.push(`Record ${index} is missing id.`);
        }

        if (recordIds.has(record.id)) {
          errors.push(`Record ${index} has duplicate id.`);
        }

        recordIds.add(record.id);

        if (!record.documentName) {
          errors.push(`Record ${index} is missing documentName.`);
        }

        if (record.hashAlgorithm !== "SHA-256") {
          errors.push(`Record ${index} has unsupported hash algorithm.`);
        }

        if (!isSha256(record.hashValue)) {
          errors.push(`Record ${index} has invalid SHA-256 hash.`);
        }

        if (!record.createdAt || !isIsoDate(record.createdAt)) {
          errors.push(`Record ${index} has invalid createdAt timestamp.`);
        }

        if (!record.status) {
          errors.push(`Record ${index} is missing status.`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
