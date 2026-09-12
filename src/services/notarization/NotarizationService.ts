import type { DocumentHash } from "../../types";
import type { NotarizationProof } from "../../types";
import type { MerkleBatchProof } from "../../types";
import { MERKLE_TREE_ALGORITHM } from "../merkle";
import { INPUT_SECURITY_LIMITS } from "../security/InputSecurityLimits";

const SHA_256_HEX_PATTERN = /^[a-f0-9]{64}$/u;

export class NotarizationService {

    static createProof(hash: DocumentHash): NotarizationProof {

        return {
            payload: {
                appId: "algorand-document-vault",
                schemaVersion: "1.0",
                hash
            },

            status: "draft",

            createdAt: new Date().toISOString()
        };
    }

    static createMerkleBatchProof(
      root: string,
      leafCount: number
    ): MerkleBatchProof {
      if (!SHA_256_HEX_PATTERN.test(root)) {
        throw new Error("Merkle root must be a lowercase SHA-256 fingerprint.");
      }

      if (
        !Number.isSafeInteger(leafCount) ||
        leafCount < 1 ||
        leafCount > INPUT_SECURITY_LIMITS.merkleBatchFiles
      ) {
        throw new Error("Merkle leaf count is outside the supported range.");
      }

      return {
        payload: {
          appId: "algorand-document-vault",
          schemaVersion: "2.0",
          proofType: "merkle-batch",
          hashAlgorithm: "SHA-256",
          treeAlgorithm: MERKLE_TREE_ALGORITHM,
          root,
          leafCount,
        },
        status: "draft",
        createdAt: new Date().toISOString(),
      };
    }
}
