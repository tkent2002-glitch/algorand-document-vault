import type { Transaction } from "algosdk";
import type { EvidenceRecord } from "../notarization";
import { AlgorandProofNoteService } from "../algorand/AlgorandProofNoteService";
import { AlgorandProofTransactionValidationService } from "../algorand/AlgorandProofTransactionValidationService";
import { AlgorandService } from "../algorand/AlgorandService";
import {
  BackupIntegrityService,
  type BackupIntegrityMetadata,
} from "../backup";
import { NotarizationService } from "../notarization";

const SHAREABLE_PROOF_SCHEMA = "adv-shareable-verification-proof-v1";
const SHAREABLE_PROOF_NETWORK = "algorand-testnet";
const SHA_256_PATTERN = /^[a-f0-9]{64}$/;
const ALGORAND_TRANSACTION_ID_PATTERN = /^[A-Z2-7]{52}$/;
const ISO_UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type ShareableVerificationProofEvidence = {
  hashAlgorithm: "SHA-256";
  hashValue: string;
  transactionId: string;
  confirmedRound: number;
};

export type ShareableVerificationProofPayload = {
  schema: typeof SHAREABLE_PROOF_SCHEMA;
  network: typeof SHAREABLE_PROOF_NETWORK;
  exportedAt: string;
  evidence: ShareableVerificationProofEvidence;
};

export type ShareableVerificationProofFile =
  ShareableVerificationProofPayload & {
    integrity: BackupIntegrityMetadata;
  };

export type ShareableVerificationProofValidationResult = {
  valid: boolean;
  proof: ShareableVerificationProofFile | null;
  errors: string[];
};

export type ShareableVerificationProofVerificationStatus =
  | "verified"
  | "document_mismatch"
  | "invalid_proof"
  | "transaction_not_confirmed"
  | "transaction_mismatch"
  | "unavailable";

export type ShareableVerificationProofVerificationResult = {
  verified: boolean;
  status: ShareableVerificationProofVerificationStatus;
  message: string;
  errors: string[];
  proof: ShareableVerificationProofFile | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isValidIsoDate(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !ISO_UTC_TIMESTAMP_PATTERN.test(value)
  ) {
    return false;
  }

  return new Date(value).toISOString() === value;
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: string[]
): boolean {
  const allowed = new Set(allowedKeys);

  return Object.keys(value).every((key) => allowed.has(key));
}

function getHttpStatus(error: unknown): number | null {
  if (!isRecord(error)) {
    return null;
  }

  if (typeof error.status === "number") {
    return error.status;
  }

  const response = error.response;

  if (isRecord(response) && typeof response.status === "number") {
    return response.status;
  }

  return null;
}

function createPayload(
  proof: ShareableVerificationProofFile
): ShareableVerificationProofPayload {
  return {
    schema: proof.schema,
    network: proof.network,
    exportedAt: proof.exportedAt,
    evidence: proof.evidence,
  };
}

function validateShape(
  value: unknown
): ShareableVerificationProofValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      proof: null,
      errors: ["The shared proof must be a JSON object."],
    };
  }

  if (value.schema !== SHAREABLE_PROOF_SCHEMA) {
    errors.push("The shared proof schema is not supported.");
  }

  if (
    !hasOnlyKeys(value, [
      "schema",
      "network",
      "exportedAt",
      "evidence",
      "integrity",
    ])
  ) {
    errors.push("The shared proof contains unsupported fields.");
  }

  if (value.network !== SHAREABLE_PROOF_NETWORK) {
    errors.push("The shared proof is not for Algorand TestNet.");
  }

  if (!isValidIsoDate(value.exportedAt)) {
    errors.push("The shared proof export timestamp is invalid.");
  }

  const evidence = value.evidence;

  if (!isRecord(evidence)) {
    errors.push("The shared proof evidence payload is missing.");
  } else {
    if (
      !hasOnlyKeys(evidence, [
        "hashAlgorithm",
        "hashValue",
        "transactionId",
        "confirmedRound",
      ])
    ) {
      errors.push("The shared proof evidence contains unsupported fields.");
    }

    if (evidence.hashAlgorithm !== "SHA-256") {
      errors.push("The shared proof must use SHA-256.");
    }

    if (
      typeof evidence.hashValue !== "string" ||
      !SHA_256_PATTERN.test(evidence.hashValue)
    ) {
      errors.push("The shared proof fingerprint is invalid.");
    }

    if (
      typeof evidence.transactionId !== "string" ||
      !ALGORAND_TRANSACTION_ID_PATTERN.test(evidence.transactionId)
    ) {
      errors.push("The shared proof transaction ID is invalid.");
    }

    if (
      typeof evidence.confirmedRound !== "number" ||
      !Number.isSafeInteger(evidence.confirmedRound) ||
      evidence.confirmedRound <= 0
    ) {
      errors.push("The shared proof confirmation round is invalid.");
    }
  }

  const integrity = value.integrity;

  if (!isRecord(integrity)) {
    errors.push("The shared proof integrity metadata is missing.");
  } else {
    if (!hasOnlyKeys(integrity, ["algorithm", "digest"])) {
      errors.push("The shared proof integrity metadata contains unsupported fields.");
    }

    if (integrity.algorithm !== "SHA-256") {
      errors.push("The shared proof integrity algorithm is invalid.");
    }

    if (
      typeof integrity.digest !== "string" ||
      !SHA_256_PATTERN.test(integrity.digest)
    ) {
      errors.push("The shared proof integrity digest is invalid.");
    }
  }

  return {
    valid: errors.length === 0,
    proof:
      errors.length === 0
        ? (value as ShareableVerificationProofFile)
        : null,
    errors,
  };
}

export class ShareableVerificationProofService {
  static async create(
    record: EvidenceRecord
  ): Promise<ShareableVerificationProofFile> {
    if (
      record.status !== "confirmed" ||
      !record.algorandTransactionId ||
      !record.confirmedRound
    ) {
      throw new Error(
        "A confirmed Algorand evidence record is required to create a shared proof."
      );
    }

    if (!SHA_256_PATTERN.test(record.hashValue)) {
      throw new Error("The evidence record fingerprint is invalid.");
    }

    if (!ALGORAND_TRANSACTION_ID_PATTERN.test(record.algorandTransactionId)) {
      throw new Error("The evidence record transaction ID is invalid.");
    }

    if (
      !Number.isSafeInteger(record.confirmedRound) ||
      record.confirmedRound <= 0
    ) {
      throw new Error("The evidence record confirmation round is invalid.");
    }

    const payload: ShareableVerificationProofPayload = {
      schema: SHAREABLE_PROOF_SCHEMA,
      network: SHAREABLE_PROOF_NETWORK,
      exportedAt: new Date().toISOString(),
      evidence: {
        hashAlgorithm: "SHA-256",
        hashValue: record.hashValue,
        transactionId: record.algorandTransactionId,
        confirmedRound: record.confirmedRound,
      },
    };

    return {
      ...payload,
      integrity: await BackupIntegrityService.createIntegrity(payload),
    };
  }

  static async validate(
    value: unknown
  ): Promise<ShareableVerificationProofValidationResult> {
    const shapeResult = validateShape(value);

    if (!shapeResult.valid || !shapeResult.proof) {
      return shapeResult;
    }

    const integrityValid = await BackupIntegrityService.verifyIntegrity(
      createPayload(shapeResult.proof),
      shapeResult.proof.integrity
    );

    if (!integrityValid) {
      return {
        valid: false,
        proof: null,
        errors: ["The shared proof integrity check failed."],
      };
    }

    return shapeResult;
  }

  static async verify(
    documentHash: string,
    value: unknown
  ): Promise<ShareableVerificationProofVerificationResult> {
    const validation = await this.validate(value);

    if (!validation.valid || !validation.proof) {
      return {
        verified: false,
        status: "invalid_proof",
        message: "The shared proof is invalid or has been changed.",
        errors: validation.errors,
        proof: null,
      };
    }

    const proof = validation.proof;

    if (documentHash !== proof.evidence.hashValue) {
      return {
        verified: false,
        status: "document_mismatch",
        message: "The selected document does not match the shared proof fingerprint.",
        errors: [],
        proof,
      };
    }

    try {
      const client = AlgorandService.createAlgodClient();
      const pendingInfo = await client
        .pendingTransactionInformation(proof.evidence.transactionId)
        .do();
      const confirmedRound = Number(pendingInfo.confirmedRound ?? 0);

      if (confirmedRound <= 0) {
        return {
          verified: false,
          status: "transaction_not_confirmed",
          message: "The proof transaction is not confirmed on Algorand TestNet.",
          errors: [],
          proof,
        };
      }

      const transaction = pendingInfo.txn.txn as Transaction;

      if (
        confirmedRound !== proof.evidence.confirmedRound ||
        transaction.txID() !== proof.evidence.transactionId
      ) {
        return {
          verified: false,
          status: "transaction_mismatch",
          message: "The public transaction receipt does not match the shared proof.",
          errors: [],
          proof,
        };
      }

      const canonicalProof = NotarizationService.createProof({
        algorithm: "SHA-256",
        value: proof.evidence.hashValue,
      });
      const policyResult =
        AlgorandProofTransactionValidationService.validateTransaction({
        transaction,
        expectedTransactionId: proof.evidence.transactionId,
        expectedSenderAddress: transaction.sender.toString(),
        expectedNote: AlgorandProofNoteService.createNote(canonicalProof),
      });

      if (!policyResult.valid) {
        return {
          verified: false,
          status: "transaction_mismatch",
          message: "The Algorand transaction does not contain the expected ADv proof.",
          errors: policyResult.errors,
          proof,
        };
      }

      return {
        verified: true,
        status: "verified",
        message: "The document and shared proof are confirmed on Algorand TestNet.",
        errors: [],
        proof,
      };
    } catch (error) {
      const notFound = getHttpStatus(error) === 404;

      return {
        verified: false,
        status: notFound ? "transaction_not_confirmed" : "unavailable",
        message: notFound
          ? "The proof transaction was not found on Algorand TestNet."
          : "Algorand TestNet could not be reached. The proof has not been marked invalid.",
        errors: [],
        proof,
      };
    }
  }
}
