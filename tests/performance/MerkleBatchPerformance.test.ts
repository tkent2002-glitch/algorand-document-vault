import { describe, expect, it } from "vitest";
import { MerkleTreeService } from "../../src/services/merkle";

describe("Merkle batch performance", () => {
  it("constructs and samples proofs for the 1,000-document limit", async () => {
    const hashes = Array.from({ length: 1_000 }, (_, index) =>
      index.toString(16).padStart(64, "0")
    );
    const startedAt = performance.now();
    const tree = await MerkleTreeService.build(hashes);
    const elapsedMs = performance.now() - startedAt;

    expect(tree.leafCount).toBe(1_000);
    expect(tree.members[0].proof.siblings).toHaveLength(10);
    await expect(MerkleTreeService.verify(tree.members[0].proof)).resolves.toBe(true);
    await expect(MerkleTreeService.verify(tree.members[499].proof)).resolves.toBe(true);
    await expect(MerkleTreeService.verify(tree.members[999].proof)).resolves.toBe(true);
    expect(elapsedMs).toBeLessThan(5_000);
  });
});
