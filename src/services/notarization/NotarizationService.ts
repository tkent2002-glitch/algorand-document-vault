import type { DocumentHash } from "../../types";
import type { NotarizationProof } from "../../types";

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
}
