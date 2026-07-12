import { describe, expect, it } from "vitest";
import { HashService } from "../../src/services/crypto/HashService";

describe("HashService", () => {
  it("creates the expected SHA-256 hash from an ArrayBuffer", async () => {
    const input = new TextEncoder().encode("hello").buffer;

    const hash = await HashService.sha256FromArrayBuffer(input);

    expect(hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("creates the expected SHA-256 hash from a File", async () => {
    const file = new File(["hello"], "hello.txt", {
      type: "text/plain",
    });

    const hash = await HashService.sha256FromFile(file);

    expect(hash).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });
});
