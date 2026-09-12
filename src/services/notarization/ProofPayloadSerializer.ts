import type { AnchoringProof } from "../../types";

export class ProofPayloadSerializer {

    static serialize(
        proof: AnchoringProof
    ): string {

        if (proof.payload.schemaVersion === "2.0") {
            return JSON.stringify({
                schema: "adv-proof-v2",
                proofType: "merkle-batch",
                hashAlgorithm: proof.payload.hashAlgorithm,
                treeAlgorithm: proof.payload.treeAlgorithm,
                root: proof.payload.root,
                leafCount: proof.payload.leafCount
            });
        }

        return JSON.stringify({

            schema: "adv-proof-v1",

            proofType: "document-integrity",

            hashAlgorithm:
                proof.payload.hash.algorithm,

            hash:
                proof.payload.hash.value

        });
    }
}
