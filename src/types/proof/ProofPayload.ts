import type { DocumentHash } from "../Hash";

export type ProofSchemaVersion = "1.0";

export type ProofPayload = {
  appId: "algorand-document-vault";
  schemaVersion: ProofSchemaVersion;
  hash: DocumentHash;
};
