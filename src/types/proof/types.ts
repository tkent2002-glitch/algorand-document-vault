import type { MerkleBatchProof } from "./MerkleBatchProof";
import type { NotarizationProof } from "./NotarizationProof";

export type AnchoringProof = NotarizationProof | MerkleBatchProof;
