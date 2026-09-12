import type { Transaction } from "algosdk";
import type {
  BatchEvidenceMemberRecord,
  BatchEvidenceRecord,
} from "../notarization";
import { NotarizationService } from "../notarization";
import { MerkleTreeService, type MerkleMembershipProof } from "../merkle";
import { AlgorandProofNoteService } from "../algorand/AlgorandProofNoteService";
import { AlgorandProofTransactionValidationService } from "../algorand/AlgorandProofTransactionValidationService";
import { AlgorandService } from "../algorand/AlgorandService";
import {
  BackupIntegrityService,
  type BackupIntegrityMetadata,
} from "../backup";
import type {
  ShareableVerificationProofVerificationResult,
} from "./ShareableVerificationProofService";

const SCHEMA = "adv-merkle-shareable-verification-proof-v1" as const;
const NETWORK = "algorand-testnet" as const;
const SHA_256 = /^[a-f0-9]{64}$/u;
const TX_ID = /^[A-Z2-7]{52}$/u;

export type MerkleShareableVerificationProofPayload = {
  schema: typeof SCHEMA;
  network: typeof NETWORK;
  exportedAt: string;
  evidence: {
    hashAlgorithm: "SHA-256";
    hashValue: string;
    treeAlgorithm: "adv-merkle-sha256-v1";
    root: string;
    occurrence: number;
    leafIndex: number;
    leafCount: number;
    siblings: MerkleMembershipProof["siblings"];
    transactionId: string;
    confirmedRound: number;
  };
};

export type MerkleShareableVerificationProofFile =
  MerkleShareableVerificationProofPayload & {
    integrity: BackupIntegrityMetadata;
  };

export type MerkleShareableVerificationProofValidationResult = {
  valid: boolean;
  proof: MerkleShareableVerificationProofFile | null;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function onlyKeys(value: Record<string, unknown>, keys: string[]) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function payloadOf(
  proof: MerkleShareableVerificationProofFile
): MerkleShareableVerificationProofPayload {
  return {
    schema: proof.schema,
    network: proof.network,
    exportedAt: proof.exportedAt,
    evidence: proof.evidence,
  };
}

function membershipOf(
  proof: MerkleShareableVerificationProofFile
): MerkleMembershipProof {
  return {
    algorithm: proof.evidence.treeAlgorithm,
    documentHash: proof.evidence.hashValue,
    occurrence: proof.evidence.occurrence,
    leafIndex: proof.evidence.leafIndex,
    leafCount: proof.evidence.leafCount,
    root: proof.evidence.root,
    siblings: proof.evidence.siblings,
  };
}

export class MerkleShareableVerificationProofService {
  static async create(
    batch: BatchEvidenceRecord,
    member: BatchEvidenceMemberRecord
  ): Promise<MerkleShareableVerificationProofFile> {
    if (
      batch.status !== "confirmed" ||
      !batch.algorandTransactionId ||
      !batch.confirmedRound ||
      member.batchId !== batch.id ||
      member.membershipProof.root !== batch.merkleRoot ||
      !(await MerkleTreeService.verify(member.membershipProof))
    ) {
      throw new Error("Confirmed batch evidence with a valid membership proof is required.");
    }

    const payload: MerkleShareableVerificationProofPayload = {
      schema: SCHEMA,
      network: NETWORK,
      exportedAt: new Date().toISOString(),
      evidence: {
        hashAlgorithm: "SHA-256",
        hashValue: member.hashValue,
        treeAlgorithm: member.membershipProof.algorithm,
        root: batch.merkleRoot,
        occurrence: member.occurrence,
        leafIndex: member.leafIndex,
        leafCount: batch.leafCount,
        siblings: member.membershipProof.siblings,
        transactionId: batch.algorandTransactionId,
        confirmedRound: batch.confirmedRound,
      },
    };
    return {
      ...payload,
      integrity: await BackupIntegrityService.createIntegrity(payload),
    };
  }

  static async validate(
    value: unknown
  ): Promise<MerkleShareableVerificationProofValidationResult> {
    const errors: string[] = [];
    if (!isRecord(value)) {
      return { valid: false, proof: null, errors: ["The Merkle proof must be an object."] };
    }
    const evidence = isRecord(value.evidence) ? value.evidence : null;
    const integrity = isRecord(value.integrity) ? value.integrity : null;
    if (
      value.schema !== SCHEMA ||
      value.network !== NETWORK ||
      !onlyKeys(value, ["schema", "network", "exportedAt", "evidence", "integrity"])
    ) errors.push("The Merkle shared proof schema is not supported.");
    if (typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt))) {
      errors.push("The Merkle shared proof timestamp is invalid.");
    }
    if (
      !evidence ||
      !onlyKeys(evidence, [
        "hashAlgorithm", "hashValue", "treeAlgorithm", "root", "occurrence",
        "leafIndex", "leafCount", "siblings", "transactionId", "confirmedRound",
      ]) ||
      evidence.hashAlgorithm !== "SHA-256" ||
      typeof evidence.hashValue !== "string" || !SHA_256.test(evidence.hashValue) ||
      evidence.treeAlgorithm !== "adv-merkle-sha256-v1" ||
      typeof evidence.root !== "string" || !SHA_256.test(evidence.root) ||
      !Number.isSafeInteger(evidence.occurrence) ||
      !Number.isSafeInteger(evidence.leafIndex) ||
      !Number.isSafeInteger(evidence.leafCount) ||
      !Array.isArray(evidence.siblings) ||
      typeof evidence.transactionId !== "string" || !TX_ID.test(evidence.transactionId) ||
      !Number.isSafeInteger(evidence.confirmedRound) || Number(evidence.confirmedRound) <= 0
    ) errors.push("The Merkle shared proof evidence is invalid.");
    if (
      !integrity ||
      !onlyKeys(integrity, ["algorithm", "digest"]) ||
      integrity.algorithm !== "SHA-256" ||
      typeof integrity.digest !== "string" || !SHA_256.test(integrity.digest)
    ) errors.push("The Merkle shared proof integrity metadata is invalid.");

    if (errors.length) return { valid: false, proof: null, errors };
    const proof = value as MerkleShareableVerificationProofFile;
    if (!(await BackupIntegrityService.verifyIntegrity(payloadOf(proof), proof.integrity))) {
      return { valid: false, proof: null, errors: ["The Merkle shared proof integrity check failed."] };
    }
    if (!(await MerkleTreeService.verify(membershipOf(proof)))) {
      return { valid: false, proof: null, errors: ["The membership proof does not reconstruct the Merkle root."] };
    }
    return { valid: true, proof, errors: [] };
  }

  static async verify(
    documentHash: string,
    value: unknown
  ): Promise<ShareableVerificationProofVerificationResult> {
    const validation = await this.validate(value);
    if (!validation.valid || !validation.proof) {
      return { verified: false, status: "invalid_proof", message: "The Merkle shared proof is invalid or changed.", errors: validation.errors, proof: null };
    }
    const proof = validation.proof;
    if (documentHash !== proof.evidence.hashValue) {
      return { verified: false, status: "document_mismatch", message: "The selected document does not match this batch membership proof.", errors: [], proof: null };
    }

    try {
      const pending = await AlgorandService.createAlgodClient()
        .pendingTransactionInformation(proof.evidence.transactionId).do();
      const round = Number(pending.confirmedRound ?? 0);
      if (round <= 0 || round !== proof.evidence.confirmedRound) {
        return { verified: false, status: "transaction_not_confirmed", message: "The batch anchor is not confirmed at the claimed round.", errors: [], proof: null };
      }
      const transaction = pending.txn.txn as Transaction;
      const anchor = NotarizationService.createMerkleBatchProof(
        proof.evidence.root,
        proof.evidence.leafCount
      );
      const policy = AlgorandProofTransactionValidationService.validateTransaction({
        transaction,
        expectedTransactionId: proof.evidence.transactionId,
        expectedSenderAddress: transaction.sender.toString(),
        expectedNote: AlgorandProofNoteService.createNote(anchor),
      });
      if (!policy.valid) {
        return { verified: false, status: "transaction_mismatch", message: "The Algorand transaction does not contain the expected batch root.", errors: policy.errors, proof: null };
      }
      return { verified: true, status: "verified", message: "The document membership proof and batch anchor are confirmed on Algorand TestNet.", errors: [], proof: null };
    } catch {
      return { verified: false, status: "unavailable", message: "Algorand TestNet could not be reached. The proof has not been marked invalid.", errors: [], proof: null };
    }
  }
}
