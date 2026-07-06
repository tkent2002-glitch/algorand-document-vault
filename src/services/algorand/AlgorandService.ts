import type { NotarizationProof } from "../../types";

export class AlgorandService {

    static async submitProof(
        proof: NotarizationProof
    ): Promise<NotarizationProof> {

        console.log(
            "Algorand submission placeholder",
            proof
        );

        return {

            ...proof,

            status: "pending_wallet_signature"
        };
    }
}
