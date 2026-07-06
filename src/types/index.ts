export type { DocumentId, VaultDocument } from "./Document";
export type { HashAlgorithm, DocumentHash } from "./Hash";
export type {
  NotarizationRecord,
  NotarizationRequest,
  NotarizationStatus,
} from "./Notarization";
export type { VerificationResult, VerificationStatus } from "./Verification";

export type {
  NotarizationProof,
  NotarizationProofStatus,
  ProofPayload,
  ProofSchemaVersion,
  VerificationProof,
  VerificationProofStatus,
} from "./proof";

export type {
  WalletConnection,
  WalletConnectionStatus,
} from "./wallet";

export type {
  AlgorandNetwork,
  AlgorandNetworkConfig,
  AlgorandProofTransactionDraft,
} from "./algorand";

export { DEFAULT_ALGORAND_NETWORK_CONFIG } from "./algorand";
