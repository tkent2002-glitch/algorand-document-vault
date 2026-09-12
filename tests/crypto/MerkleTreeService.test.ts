import { describe, expect, it } from "vitest";
import {
  MERKLE_TREE_ALGORITHM,
  MerkleTreeService,
  type MerkleMembershipProof,
} from "../../src/services/merkle";

const HASHES = {
  a: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
  b: "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
  c: "2e7d2c03a9507ae265ecf5b5356885a53393a2029d241394997265a1a25aefc6",
  d: "18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4",
} as const;

describe("MerkleTreeService", () => {
  it.each([
    [[HASHES.a], "e7eb7d17c2a39c57f85e99178181e8b7ee5edc767839e241b1f67604171b066c"],
    [[HASHES.a, HASHES.b], "e835cd1404dab0f4ac5bf193945f981d91e41b8cae9b01a851f51f5a5dc8f677"],
    [[HASHES.a, HASHES.b, HASHES.c], "29c6e5cb7cfc5e43c2ff12573695f651034ba0e956d631a3e2d9e2d7f0364353"],
    [[HASHES.a, HASHES.b, HASHES.c, HASHES.d], "39e93c0fad3ed0a9a77376e3acabce8dfea503e231bac3c69555f6400897060a"],
    [[HASHES.a, HASHES.a], "d832b6502b6214b5dd57d1bf1103b1f2275f0721a4af8b5a266b473544fd0382"],
  ])("matches the published deterministic vector %#", async (hashes, root) => {
    await expect(MerkleTreeService.build(hashes)).resolves.toMatchObject({
      algorithm: MERKLE_TREE_ALGORITHM,
      root,
      leafCount: hashes.length,
    });
  });

  it("is independent of selection order", async () => {
    const forward = await MerkleTreeService.build([
      HASHES.a,
      HASHES.b,
      HASHES.c,
      HASHES.d,
    ]);
    const reverse = await MerkleTreeService.build([
      HASHES.d,
      HASHES.c,
      HASHES.b,
      HASHES.a,
    ]);

    expect(reverse.root).toBe(forward.root);
  });

  it("assigns distinct occurrences to duplicate fingerprints", async () => {
    const batch = await MerkleTreeService.build([
      HASHES.a,
      HASHES.a,
      HASHES.b,
    ]);
    const duplicates = batch.members
      .filter((member) => member.documentHash === HASHES.a)
      .map((member) => member.occurrence);

    expect(duplicates).toEqual([0, 1]);
  });

  it("verifies every membership proof in an odd-sized tree", async () => {
    const batch = await MerkleTreeService.build([
      HASHES.a,
      HASHES.b,
      HASHES.c,
    ]);

    await Promise.all(
      batch.members.map(async (member) => {
        await expect(MerkleTreeService.verify(member.proof)).resolves.toBe(true);
      })
    );
  });

  it("rejects a modified document fingerprint", async () => {
    const batch = await MerkleTreeService.build([HASHES.a, HASHES.b]);
    const proof: MerkleMembershipProof = {
      ...batch.members[0].proof,
      documentHash: HASHES.c,
    };

    await expect(MerkleTreeService.verify(proof)).resolves.toBe(false);
  });

  it("rejects a proof transplanted to another root", async () => {
    const source = await MerkleTreeService.build([HASHES.a, HASHES.b]);
    const destination = await MerkleTreeService.build([HASHES.a, HASHES.c]);
    const proof: MerkleMembershipProof = {
      ...source.members.find((member) => member.documentHash === HASHES.a)!.proof,
      root: destination.root,
    };

    await expect(MerkleTreeService.verify(proof)).resolves.toBe(false);
  });

  it("rejects a non-canonical odd-node sibling", async () => {
    const batch = await MerkleTreeService.build([
      HASHES.a,
      HASHES.b,
      HASHES.c,
    ]);
    const last = batch.members.find(
      (member) => member.leafIndex === batch.leafCount - 1
    )!;
    const proof: MerkleMembershipProof = {
      ...last.proof,
      siblings: [
        { ...last.proof.siblings[0], hash: HASHES.d },
        ...last.proof.siblings.slice(1),
      ],
    };

    await expect(MerkleTreeService.verify(proof)).resolves.toBe(false);
  });

  it("rejects empty, oversized, and malformed inputs", async () => {
    await expect(MerkleTreeService.build([])).rejects.toThrow();
    await expect(
      MerkleTreeService.build(Array.from({ length: 1_001 }, () => HASHES.a))
    ).rejects.toThrow();
    await expect(MerkleTreeService.build(["ABC"])).rejects.toThrow();
  });
});
