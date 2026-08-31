import { KeyDerivationService } from "./KeyDerivationService";
import { SecureRandomService } from "./SecureRandomService";
import type {
  EncryptedEvidenceBackupFile,
} from "./EncryptionTypes";
import { INPUT_SECURITY_LIMITS } from "./InputSecurityLimits";

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

function decodeBackupBase64(value: string): Uint8Array {
  try {
    return base64ToBytes(value);
  } catch {
    throw new Error("Invalid backup encryption metadata.");
  }
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

    if (password.length < 12) {
      throw new Error("Backup encryption password must contain at least 12 characters.");
    }

    if (password.length > INPUT_SECURITY_LIMITS.passwordCharacters) {
      throw new Error("Backup encryption password is too long.");
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

    if (password.length > INPUT_SECURITY_LIMITS.passwordCharacters) {
      throw new Error("Backup decryption password is too long.");
    }

    if (!backup || typeof backup !== "object") {
      throw new Error("Invalid encrypted backup file.");
    }

    if (backup.schema !== "adv-encrypted-evidence-backup-v1") {
      throw new Error("Unsupported encrypted backup schema.");
    }

    if (
      !backup.encryption ||
      typeof backup.encryption !== "object" ||
      backup.encryption.algorithm !== "AES-GCM" ||
      backup.encryption.keyDerivation !== "PBKDF2-SHA-256" ||
      backup.encryption.iterations !== PBKDF2_ITERATIONS
    ) {
      throw new Error("Unsupported backup encryption configuration.");
    }

    if (
      typeof backup.ciphertext !== "string" ||
      backup.ciphertext.length > INPUT_SECURITY_LIMITS.encryptedCiphertextCharacters
    ) {
      throw new Error("Encrypted backup payload is invalid or too large.");
    }

    if (
      typeof backup.encryption.salt !== "string" ||
      backup.encryption.salt.length > 64 ||
      typeof backup.encryption.iv !== "string" ||
      backup.encryption.iv.length > 64
    ) {
      throw new Error("Invalid backup encryption metadata.");
    }

    const salt = decodeBackupBase64(backup.encryption.salt);
    const iv = decodeBackupBase64(backup.encryption.iv);
    const ciphertext = decodeBackupBase64(backup.ciphertext);

    if (
      salt.byteLength !== SALT_LENGTH_BYTES ||
      iv.byteLength !== IV_LENGTH_BYTES
    ) {
      throw new Error("Invalid backup encryption metadata.");
    }

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
