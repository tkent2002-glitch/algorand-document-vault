import { INPUT_SECURITY_LIMITS } from "../security/InputSecurityLimits";
import {
  MERKLE_TREE_ALGORITHM,
  type MerkleBatch,
  type MerkleMembershipProof,
  type MerkleProofSibling,
} from "./MerkleTypes";

const SHA_256_HEX_PATTERN = /^[a-f0-9]{64}$/u;
const LEAF_DOMAIN = new TextEncoder().encode("ADV-MERKLE-LEAF-V1\0");
const NODE_DOMAIN = new TextEncoder().encode("ADV-MERKLE-NODE-V1\0");

function assertSha256Hex(value: string, label: string): void {
  if (!SHA_256_HEX_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256 fingerprint.`);
  }
}

function hexToBytes(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return bytes;
}

function bytesToHex(value: Uint8Array): string {
  return Array.from(value)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function concatenate(...values: Uint8Array[]): Uint8Array {
  const length = values.reduce((total, value) => total + value.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;

  for (const value of values) {
    result.set(value, offset);
    offset += value.length;
  }

  return result;
}

function encodeUint32(value: number): Uint8Array {
  if (!Number.isSafeInteger(value) || value < 0 || value > 0xffffffff) {
    throw new Error("Merkle occurrence must be an unsigned 32-bit integer.");
  }

  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

async function sha256(value: Uint8Array): Promise<Uint8Array> {
  const input = new Uint8Array(value.byteLength);
  input.set(value);
  const digest = await crypto.subtle.digest("SHA-256", input.buffer);
  return new Uint8Array(digest);
}

async function createLeaf(
  documentHash: string,
  occurrence: number
): Promise<Uint8Array> {
  assertSha256Hex(documentHash, "Document hash");

  return sha256(
    concatenate(
      LEAF_DOMAIN,
      hexToBytes(documentHash),
      encodeUint32(occurrence)
    )
  );
}

async function createNode(
  left: Uint8Array,
  right: Uint8Array
): Promise<Uint8Array> {
  if (left.length !== 32 || right.length !== 32) {
    throw new Error("Merkle node children must be 32 bytes.");
  }

  return sha256(concatenate(NODE_DOMAIN, left, right));
}

function expectedProofDepth(leafCount: number): number {
  return leafCount <= 1 ? 0 : Math.ceil(Math.log2(leafCount));
}

export class MerkleTreeService {
  static async build(documentHashes: string[]): Promise<MerkleBatch> {
    if (
      documentHashes.length === 0 ||
      documentHashes.length > INPUT_SECURITY_LIMITS.merkleBatchFiles
    ) {
      throw new Error(
        `A Merkle batch must contain between 1 and ${INPUT_SECURITY_LIMITS.merkleBatchFiles.toLocaleString()} documents.`
      );
    }

    const sorted = documentHashes
      .map((documentHash, sourceIndex) => {
        assertSha256Hex(documentHash, "Document hash");
        return { documentHash, sourceIndex };
      })
      .sort(
        (first, second) =>
          first.documentHash.localeCompare(second.documentHash) ||
          first.sourceIndex - second.sourceIndex
      );

    const occurrences = new Map<string, number>();
    const canonicalMembers = sorted.map((entry, leafIndex) => {
      const occurrence = occurrences.get(entry.documentHash) ?? 0;
      occurrences.set(entry.documentHash, occurrence + 1);

      return {
        ...entry,
        occurrence,
        leafIndex,
      };
    });

    const leaves: Uint8Array[] = [];

    for (const member of canonicalMembers) {
      leaves.push(await createLeaf(member.documentHash, member.occurrence));
    }

    const levels: Uint8Array[][] = [leaves];

    while (levels.at(-1)!.length > 1) {
      const current = levels.at(-1)!;
      const next: Uint8Array[] = [];

      for (let index = 0; index < current.length; index += 2) {
        next.push(
          await createNode(current[index], current[index + 1] ?? current[index])
        );
      }

      levels.push(next);
    }

    const root = bytesToHex(levels.at(-1)![0]);
    const leafCount = canonicalMembers.length;
    const members = canonicalMembers.map((member) => {
      let nodeIndex = member.leafIndex;
      const siblings: MerkleProofSibling[] = [];

      for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex += 1) {
        const level = levels[levelIndex];
        const currentIsLeft = nodeIndex % 2 === 0;
        const siblingIndex = currentIsLeft
          ? Math.min(nodeIndex + 1, level.length - 1)
          : nodeIndex - 1;

        siblings.push({
          position: currentIsLeft ? "right" : "left",
          hash: bytesToHex(level[siblingIndex]),
        });

        nodeIndex = Math.floor(nodeIndex / 2);
      }

      return {
        ...member,
        proof: {
          algorithm: MERKLE_TREE_ALGORITHM,
          documentHash: member.documentHash,
          occurrence: member.occurrence,
          leafIndex: member.leafIndex,
          leafCount,
          root,
          siblings,
        },
      };
    });

    return {
      algorithm: MERKLE_TREE_ALGORITHM,
      root,
      leafCount,
      members,
    };
  }

  static async verify(proof: MerkleMembershipProof): Promise<boolean> {
    if (
      proof.algorithm !== MERKLE_TREE_ALGORITHM ||
      !Number.isSafeInteger(proof.leafCount) ||
      proof.leafCount < 1 ||
      proof.leafCount > INPUT_SECURITY_LIMITS.merkleBatchFiles ||
      !Number.isSafeInteger(proof.leafIndex) ||
      proof.leafIndex < 0 ||
      proof.leafIndex >= proof.leafCount ||
      !Number.isSafeInteger(proof.occurrence) ||
      proof.occurrence < 0 ||
      proof.occurrence >= proof.leafCount ||
      proof.siblings.length !== expectedProofDepth(proof.leafCount) ||
      proof.siblings.length > INPUT_SECURITY_LIMITS.merkleProofDepth
    ) {
      return false;
    }

    try {
      assertSha256Hex(proof.documentHash, "Document hash");
      assertSha256Hex(proof.root, "Merkle root");

      let current = await createLeaf(proof.documentHash, proof.occurrence);
      let nodeIndex = proof.leafIndex;
      let levelWidth = proof.leafCount;

      for (const sibling of proof.siblings) {
        assertSha256Hex(sibling.hash, "Merkle sibling");

        const currentIsLeft = nodeIndex % 2 === 0;
        const expectedPosition = currentIsLeft ? "right" : "left";

        if (sibling.position !== expectedPosition) {
          return false;
        }

        const siblingBytes = hexToBytes(sibling.hash);

        if (
          currentIsLeft &&
          nodeIndex + 1 >= levelWidth &&
          sibling.hash !== bytesToHex(current)
        ) {
          return false;
        }

        current = currentIsLeft
          ? await createNode(current, siblingBytes)
          : await createNode(siblingBytes, current);
        nodeIndex = Math.floor(nodeIndex / 2);
        levelWidth = Math.ceil(levelWidth / 2);
      }

      return bytesToHex(current) === proof.root;
    } catch {
      return false;
    }
  }
}
