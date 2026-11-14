import { describe, expect, it } from "vitest";
import {
  BatchHashingService,
  MerkleTreeService,
} from "../../src/services/merkle";

describe("Merkle batch performance", () => {
  it("constructs and samples proofs for the 1,000-document limit", async () => {
    const hashes = Array.from({ length: 1_000 }, (_, index) =>
      index.toString(16).padStart(64, "0")
    );
    const startedAt = performance.now();
    const tree = await MerkleTreeService.build(hashes);
    const elapsedMs = performance.now() - startedAt;

    console.info(
      `1,000-member Merkle tree and proof construction: ${elapsedMs.toFixed(1)} ms`
    );
    expect(tree.leafCount).toBe(1_000);
    expect(tree.members[0].proof.siblings).toHaveLength(10);
    await expect(MerkleTreeService.verify(tree.members[0].proof)).resolves.toBe(true);
    await expect(MerkleTreeService.verify(tree.members[499].proof)).resolves.toBe(true);
    await expect(MerkleTreeService.verify(tree.members[999].proof)).resolves.toBe(true);
    expect(elapsedMs).toBeLessThan(5_000);
  });

  it("hashes the 1,000-document limit within the regression ceiling", async () => {
    const files = Array.from(
      { length: 1_000 },
      (_, index) =>
        new File(
          [new Uint8Array([index & 0xff, (index >> 8) & 0xff])],
          `batch-document-${index.toString().padStart(4, "0")}.bin`
        )
    );
    const startedAt = performance.now();
    const results = await BatchHashingService.hashFiles(files);
    const elapsedMs = performance.now() - startedAt;

    console.info(
      `1,000-document batch hashing performance: ${elapsedMs.toFixed(1)} ms`
    );
    expect(results).toHaveLength(1_000);
    expect(new Set(results.map((result) => result.hashValue)).size).toBe(1_000);
    expect(elapsedMs).toBeLessThan(15_000);
  });

  it("hashes a representative 25 MiB batch member within the regression ceiling", async () => {
    const file = new File(
      [new Uint8Array(25 * 1024 * 1024)],
      "representative-large-document.bin"
    );
    const startedAt = performance.now();
    const [result] = await BatchHashingService.hashFiles([file]);
    const elapsedMs = performance.now() - startedAt;

    console.info(
      `25 MiB batch-member hashing performance: ${elapsedMs.toFixed(1)} ms`
    );
    expect(result.size).toBe(25 * 1024 * 1024);
    expect(result.hashValue).toHaveLength(64);
    expect(elapsedMs).toBeLessThan(15_000);
  });
});
