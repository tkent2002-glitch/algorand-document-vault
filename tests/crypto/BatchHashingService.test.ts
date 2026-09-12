import { describe, expect, it, vi } from "vitest";
import { BatchHashingService } from "../../src/services/merkle";

function createFile(name: string, contents: string): File {
  return new File([contents], name, {
    lastModified: 1_788_000_000_000,
    type: "text/plain",
  });
}

describe("BatchHashingService", () => {
  it("hashes files sequentially and reports progress", async () => {
    const progress = vi.fn();
    const result = await BatchHashingService.hashFiles(
      [createFile("a.txt", "a"), createFile("b.txt", "b")],
      { onProgress: progress }
    );

    expect(result).toEqual([
      expect.objectContaining({
        sourceIndex: 0,
        documentName: "a.txt",
        hashAlgorithm: "SHA-256",
        hashValue:
          "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      }),
      expect.objectContaining({
        sourceIndex: 1,
        documentName: "b.txt",
        hashAlgorithm: "SHA-256",
        hashValue:
          "3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d",
      }),
    ]);
    expect(progress).toHaveBeenLastCalledWith({
      completedFiles: 2,
      totalFiles: 2,
      currentFileName: "",
    });
  });

  it("rejects empty and oversized selections", async () => {
    await expect(BatchHashingService.hashFiles([])).rejects.toThrow();
    const empty = createFile("empty.txt", "");
    await expect(BatchHashingService.hashFiles([empty])).rejects.toThrow(
      "empty"
    );
  });

  it("honors cancellation before reading a document", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      BatchHashingService.hashFiles([createFile("a.txt", "a")], {
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
