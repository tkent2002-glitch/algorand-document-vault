import type { NotarizationProof } from "../../types";

export class ProofPayloadSerializer {

    static serialize(
        proof: NotarizationProof
    ): string {

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
