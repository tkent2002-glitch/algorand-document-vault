import { KeyDerivationService } from "./KeyDerivationService";
import { SecureRandomService } from "./SecureRandomService";
import type {
  EncryptedEvidenceBackupFile,
} from "./EncryptionTypes";

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH_BYTES = 16;
const IV_LENGTH_BYTES = 12;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export class BackupEncryptionService {
  static readonly algorithm = "AES-GCM";
  static readonly keyDerivation = "PBKDF2-SHA-256";
  static readonly iterations = PBKDF2_ITERATIONS;

  static async encrypt(
    payload: unknown,
    password: string
  ): Promise<EncryptedEvidenceBackupFile> {
    if (!password) {
      throw new Error("Backup encryption password is required.");
    }

    const salt = SecureRandomService.randomBytes(SALT_LENGTH_BYTES);
    const iv = SecureRandomService.randomBytes(IV_LENGTH_BYTES);

    const key = await KeyDerivationService.deriveAesKeyFromPassword(
      password,
      salt
    );

    const plaintext = new TextEncoder().encode(JSON.stringify(payload));

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(iv),
      },
      key,
      toArrayBuffer(plaintext)
    );

    return {
      schema: "adv-encrypted-evidence-backup-v1",
      exportedAt: new Date().toISOString(),
      encryption: {
        algorithm: "AES-GCM",
        keyDerivation: "PBKDF2-SHA-256",
        iterations: PBKDF2_ITERATIONS,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
      },
      ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
    };
  }

  static async decrypt<T>(
    backup: EncryptedEvidenceBackupFile,
    password: string
  ): Promise<T> {
    if (!password) {
      throw new Error("Backup decryption password is required.");
    }

    if (backup.schema !== "adv-encrypted-evidence-backup-v1") {
      throw new Error("Unsupported encrypted backup schema.");
    }

    if (
      backup.encryption.algorithm !== "AES-GCM" ||
      backup.encryption.keyDerivation !== "PBKDF2-SHA-256"
    ) {
      throw new Error("Unsupported backup encryption configuration.");
    }

    const salt = base64ToBytes(backup.encryption.salt);
    const iv = base64ToBytes(backup.encryption.iv);
    const ciphertext = base64ToBytes(backup.ciphertext);

    const key = await KeyDerivationService.deriveAesKeyFromPassword(
      password,
      salt
    );

    try {
      const plaintextBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: toArrayBuffer(iv),
        },
        key,
        toArrayBuffer(ciphertext)
      );

      return JSON.parse(new TextDecoder().decode(plaintextBuffer)) as T;
    } catch {
      throw new Error(
        "Backup decryption failed. The password may be incorrect or the file may be corrupted."
      );
    }
  }
}
