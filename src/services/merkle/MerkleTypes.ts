export const MERKLE_TREE_ALGORITHM = "adv-merkle-sha256-v1" as const;

export type MerkleTreeAlgorithm = typeof MERKLE_TREE_ALGORITHM;

export type MerkleSiblingPosition = "left" | "right";

export type MerkleProofSibling = {
  position: MerkleSiblingPosition;
  hash: string;
};

export type MerkleMembershipProof = {
  algorithm: MerkleTreeAlgorithm;
  documentHash: string;
  occurrence: number;
  leafIndex: number;
  leafCount: number;
  root: string;
  siblings: MerkleProofSibling[];
};

export type MerkleBatchMember = {
  sourceIndex: number;
  documentHash: string;
  occurrence: number;
  leafIndex: number;
  proof: MerkleMembershipProof;
};

export type MerkleBatch = {
  algorithm: MerkleTreeAlgorithm;
  root: string;
  leafCount: number;
  members: MerkleBatchMember[];
};
