export type { DocumentId, VaultDocument } from "./Document";
export type { HashAlgorithm, DocumentHash } from "./Hash";
export type {
  NotarizationRecord,
  NotarizationRequest,
  NotarizationStatus,
} from "./Notarization";
export type { VerificationResult, VerificationStatus } from "./Verification";

export type {
  AnchoringProof,
  MerkleBatchProof,
  MerkleBatchProofPayload,
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
  AlgorandUnsignedProofTransaction,
  AlgorandSignedProofTransaction,
  AlgorandTransactionInspection,
  AlgorandSubmissionResult,
  AlgorandConfirmationResult,
} from "./algorand";

export { DEFAULT_ALGORAND_NETWORK_CONFIG } from "./algorand";
