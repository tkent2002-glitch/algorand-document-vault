import {
  CURRENT_BACKUP_PBKDF2_ITERATIONS,
  isSupportedBackupPbkdf2Iterations,
} from "./BackupEncryptionParameters";

export type DerivedKeyResult = {
  key: CryptoKey;
  salt: Uint8Array;
};

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export class KeyDerivationService {
  static async deriveAesKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations = CURRENT_BACKUP_PBKDF2_ITERATIONS
  ): Promise<CryptoKey> {
    if (!password) {
      throw new Error("Password is required.");
    }

    if (salt.byteLength === 0) {
      throw new Error("Salt is required.");
    }

    if (!isSupportedBackupPbkdf2Iterations(iterations)) {
      throw new Error("Unsupported PBKDF2 iteration count.");
    }

    const encodedPassword = new TextEncoder().encode(password);
    let baseKey: CryptoKey;

    try {
      baseKey = await crypto.subtle.importKey(
        "raw",
        toArrayBuffer(encodedPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
    } finally {
      // JavaScript strings are immutable and cannot be reliably erased. This
      // clears the mutable UTF-8 copy as soon as Web Crypto has imported it.
      encodedPassword.fill(0);
    }

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: toArrayBuffer(salt),
        iterations,
        hash: "SHA-256",
      },
      baseKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  }
}
