import { describe, expect, it } from "vitest";
import { BackupEncryptionService } from "../../src/services/security/BackupEncryptionService";
import { KeyDerivationService } from "../../src/services/security/KeyDerivationService";
import { SecureRandomService } from "../../src/services/security/SecureRandomService";

describe("SecureRandomService", () => {
  it("creates the requested number of random bytes", () => {
    const bytes = SecureRandomService.randomBytes(32);

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.byteLength).toBe(32);
  });

  it("creates different random values on separate calls", () => {
    const first = SecureRandomService.randomBytes(32);
    const second = SecureRandomService.randomBytes(32);

    expect(Array.from(first)).not.toEqual(Array.from(second));
  });

  it("rejects invalid byte lengths", () => {
    expect(() => SecureRandomService.randomBytes(0)).toThrow(
      "Random byte length must be a positive integer."
    );

    expect(() => SecureRandomService.randomBytes(-1)).toThrow(
      "Random byte length must be a positive integer."
    );
  });
});

describe("KeyDerivationService", () => {
  it("derives a non-extractable AES-GCM key from a password", async () => {
    const salt = SecureRandomService.randomBytes(16);

    const key = await KeyDerivationService.deriveAesKeyFromPassword(
      "strong-test-password",
      salt
    );

    expect(key.type).toBe("secret");
    expect(key.extractable).toBe(false);
    expect(key.algorithm.name).toBe("AES-GCM");
    expect(key.usages).toContain("encrypt");
    expect(key.usages).toContain("decrypt");
  });

  it("derives equivalent keys from the same password and salt", async () => {
    const salt = new Uint8Array(16).fill(7);

    const firstKey = await KeyDerivationService.deriveAesKeyFromPassword(
      "same-password",
      salt
    );

    const secondKey = await KeyDerivationService.deriveAesKeyFromPassword(
      "same-password",
      salt
    );

    const plaintext = new TextEncoder().encode("key derivation test");
    const iv = new Uint8Array(12).fill(3);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      firstKey,
      plaintext
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      secondKey,
      encrypted
    );

    expect(new TextDecoder().decode(decrypted)).toBe("key derivation test");
  });

  it("rejects an empty password", async () => {
    const salt = SecureRandomService.randomBytes(16);

    await expect(
      KeyDerivationService.deriveAesKeyFromPassword("", salt)
    ).rejects.toThrow("Password is required.");
  });

  it("rejects an empty salt", async () => {
    await expect(
      KeyDerivationService.deriveAesKeyFromPassword(
        "test-password",
        new Uint8Array()
      )
    ).rejects.toThrow("Salt is required.");
  });
});

describe("BackupEncryptionService foundation", () => {
  it("declares the selected encryption architecture", () => {
    expect(BackupEncryptionService.algorithm).toBe("AES-GCM");
    expect(BackupEncryptionService.keyDerivation).toBe("PBKDF2-SHA-256");
    expect(BackupEncryptionService.iterations).toBe(250000);
  });
});

