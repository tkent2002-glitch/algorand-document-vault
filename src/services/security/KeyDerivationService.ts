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
    salt: Uint8Array
  ): Promise<CryptoKey> {
    if (!password) {
      throw new Error("Password is required.");
    }

    if (salt.byteLength === 0) {
      throw new Error("Salt is required.");
    }

    const encodedPassword = new TextEncoder().encode(password);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(encodedPassword),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: toArrayBuffer(salt),
        iterations: 250000,
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
