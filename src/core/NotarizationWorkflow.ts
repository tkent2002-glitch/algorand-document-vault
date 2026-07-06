import {
    DocumentValidationService,
    HashService,
    NotarizationService
} from "../services";

import type {
    DocumentHash,
    NotarizationProof
} from "../types";

export type NotarizationWorkflowResult = {

    fileName: string;

    hashValue: string;

    documentHash: DocumentHash | null;

    proof: NotarizationProof | null;

    errors: string[];
};

export class NotarizationWorkflow {

    static async execute(file: File | null): Promise<NotarizationWorkflowResult> {

        const validation =
            DocumentValidationService.validate(file);

        if (!validation.valid || !file) {

            return {

                fileName: file?.name ?? "",

                hashValue: "",

                documentHash: null,

                proof: null,

                errors: validation.errors
            };
        }

        const hashValue =
            await HashService.sha256FromFile(file);

        const documentHash: DocumentHash = {

            algorithm: "SHA-256",

            value: hashValue
        };

        const proof =
            NotarizationService.createProof(documentHash);

        return {

            fileName: file.name,

            hashValue,

            documentHash,

            proof,

            errors: []
        };
    }
}
