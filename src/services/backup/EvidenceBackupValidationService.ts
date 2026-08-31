import type { EvidenceRecord } from "../notarization";
import { INPUT_SECURITY_LIMITS } from "../security/InputSecurityLimits";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-fA-F0-9]{64}$/.test(value);
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 40 &&
    !Number.isNaN(Date.parse(value))
  );
}

function isBoundedString(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function isWithinJsonComplexityLimits(value: unknown): boolean {
  const stack: Array<{ depth: number; value: unknown }> = [
    { depth: 0, value },
  ];
  const visited = new WeakSet<object>();
  let nodes = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;

    nodes += 1;
    if (nodes > INPUT_SECURITY_LIMITS.jsonNodes) return false;
    if (current.depth > INPUT_SECURITY_LIMITS.jsonNestingDepth) return false;
    if (!current.value || typeof current.value !== "object") continue;
    if (visited.has(current.value)) continue;
    visited.add(current.value);

    const children = Array.isArray(current.value)
      ? current.value
      : Object.values(current.value);

    if (nodes + stack.length + children.length > INPUT_SECURITY_LIMITS.jsonNodes) {
      return false;
    }

    for (const child of children) {
      stack.push({ depth: current.depth + 1, value: child });
    }
  }

  return true;
}

export class EvidenceBackupValidationService {
  static validate(data: unknown): EvidenceBackupValidationResult {
    const errors: string[] = [];

    if (!isRecord(data)) {
      return {
        valid: false,
        errors: ["Backup file must be a JSON object."],
      };
    }

    const backup = data;
    const addError = (message: string): void => {
      if (errors.length < INPUT_SECURITY_LIMITS.backupValidationErrors) {
        errors.push(message);
      }
    };

    if (backup.schema !== "adv-evidence-backup-v1") {
      addError("Unsupported backup schema.");
    }

    if (!backup.exportedAt || !isIsoDate(backup.exportedAt)) {
      addError("Backup exportedAt timestamp is missing or invalid.");
    }

    if (!Array.isArray(backup.records)) {
      addError("Backup records must be an array.");
    }

    if (
      typeof backup.recordCount !== "number" ||
      !Number.isSafeInteger(backup.recordCount) ||
      backup.recordCount < 0
    ) {
      addError("Backup recordCount must be a non-negative safe integer.");
    }

    if (!isWithinJsonComplexityLimits(data)) {
      return {
        valid: false,
        errors: ["Backup JSON exceeds structural complexity limits."],
      };
    }

    if (Array.isArray(backup.records) && backup.recordCount !== backup.records.length) {
      addError("Backup recordCount does not match records length.");
    }

    if (
      Array.isArray(backup.records) &&
      backup.records.length > INPUT_SECURITY_LIMITS.backupRecords
    ) {
      addError(
        `Backup contains more than ${INPUT_SECURITY_LIMITS.backupRecords.toLocaleString()} records.`
      );
    }

    if (
      Array.isArray(backup.records) &&
      backup.records.length <= INPUT_SECURITY_LIMITS.backupRecords
    ) {
      const recordIds = new Set<string>();

      for (const [index, candidate] of backup.records.entries()) {
        if (errors.length >= INPUT_SECURITY_LIMITS.backupValidationErrors) {
          break;
        }

        if (!isRecord(candidate)) {
          addError(`Record ${index} must be a JSON object.`);
          continue;
        }

        const record = candidate;

        if (!isBoundedString(record.id, INPUT_SECURITY_LIMITS.recordIdentifierCharacters)) {
          addError(`Record ${index} has missing or invalid id.`);
        }

        if (typeof record.id === "string" && recordIds.has(record.id)) {
          addError(`Record ${index} has duplicate id.`);
        }

        if (typeof record.id === "string") {
          recordIds.add(record.id);
        }

        if (!isBoundedString(record.documentName, INPUT_SECURITY_LIMITS.documentNameCharacters)) {
          addError(`Record ${index} has missing or invalid documentName.`);
        }

        if (record.hashAlgorithm !== "SHA-256") {
          addError(`Record ${index} has unsupported hash algorithm.`);
        }

        if (!isSha256(record.hashValue)) {
          addError(`Record ${index} has invalid SHA-256 hash.`);
        }

        const proof = record.proof;
        const payload = isRecord(proof) ? proof.payload : null;
        const proofHash = isRecord(payload) ? payload.hash : null;

        if (!isRecord(proof) || !isRecord(payload) || !isRecord(proofHash)) {
          addError(`Record ${index} is missing proof hash.`);
        } else {
          if (!isIsoDate(proof.createdAt)) {
            addError(`Record ${index} has invalid proof createdAt timestamp.`);
          }
          if (!["draft", "pending_wallet_signature", "submitted", "confirmed", "failed"].includes(String(proof.status))) {
            addError(`Record ${index} has unsupported proof status.`);
          }
          if (payload.appId !== "algorand-document-vault") {
            addError(`Record ${index} has invalid proof application id.`);
          }
          if (payload.schemaVersion !== "1.0") {
            addError(`Record ${index} has unsupported proof schema version.`);
          }
          if (proofHash.algorithm !== "SHA-256") {
            addError(`Record ${index} has unsupported proof hash algorithm.`);
          }
          if (proofHash.value !== record.hashValue) {
            addError(`Record ${index} proof hash does not match record hash.`);
          }
        }

        if (!isIsoDate(record.createdAt)) {
          addError(`Record ${index} has invalid createdAt timestamp.`);
        }

        if (
          record.status === "submitted" &&
          (
            !isBoundedString(record.algorandTransactionId, INPUT_SECURITY_LIMITS.transactionIdentifierCharacters) ||
            !record.submittedAt ||
            !isIsoDate(record.submittedAt)
          )
        ) {
          addError(`Record ${index} submitted evidence is missing submission metadata.`);
        }

        if (
          record.status === "confirmed" &&
          (
            !isBoundedString(record.algorandTransactionId, INPUT_SECURITY_LIMITS.transactionIdentifierCharacters) ||
            typeof record.confirmedRound !== "number" ||
            !Number.isSafeInteger(record.confirmedRound) ||
            record.confirmedRound <= 0 ||
            !record.confirmedAt ||
            !isIsoDate(record.confirmedAt)
          )
        ) {
          addError(`Record ${index} confirmed evidence is missing confirmation metadata.`);
        }

        if (!["draft", "signed", "submitted", "confirmed", "failed"].includes(String(record.status))) {
          addError(`Record ${index} has unsupported status.`);
        }
      }
    }

    if ("integrity" in backup && backup.integrity !== undefined) {
      const integrity = backup.integrity;
      if (
        !isRecord(integrity) ||
        integrity.algorithm !== "SHA-256" ||
        !isSha256(integrity.digest)
      ) {
        addError("Backup integrity metadata is invalid.");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
