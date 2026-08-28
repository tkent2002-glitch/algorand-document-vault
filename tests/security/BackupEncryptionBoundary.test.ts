import { describe, expect, it } from "vitest";
import { BackupEncryptionService } from "../../src/services/security/BackupEncryptionService";
import type { EncryptedEvidenceBackupFile } from "../../src/services/security/EncryptionTypes";

const password = "boundary-test-password";

async function createEncryptedBackup(): Promise<EncryptedEvidenceBackupFile> {
  return BackupEncryptionService.encrypt(
    { schema: "boundary-test", value: "test-data" },
    password
  );
}

describe("BackupEncryptionService security boundaries", () => {
  it("rejects altered PBKDF2 iteration metadata", async () => {
    const backup = await createEncryptedBackup();

    const modifiedBackup: EncryptedEvidenceBackupFile = {
      ...backup,
      encryption: { ...backup.encryption, iterations: 1 },
    };

    await expect(
      BackupEncryptionService.decrypt(modifiedBackup, password)
    ).rejects.toThrow("Unsupported backup encryption configuration.");
  });

  it("rejects an invalid salt length", async () => {
    const backup = await createEncryptedBackup();

    const modifiedBackup: EncryptedEvidenceBackupFile = {
      ...backup,
      encryption: { ...backup.encryption, salt: btoa("short") },
    };

    await expect(
      BackupEncryptionService.decrypt(modifiedBackup, password)
    ).rejects.toThrow("Invalid backup encryption metadata.");
  });

  it("rejects an invalid IV length", async () => {
    const backup = await createEncryptedBackup();

    const modifiedBackup: EncryptedEvidenceBackupFile = {
      ...backup,
      encryption: { ...backup.encryption, iv: btoa("short") },
    };

    await expect(
      BackupEncryptionService.decrypt(modifiedBackup, password)
    ).rejects.toThrow("Invalid backup encryption metadata.");
  });

  it("rejects malformed Base64 encryption metadata with a controlled error", async () => {
    const backup = await createEncryptedBackup();

    const modifiedBackup: EncryptedEvidenceBackupFile = {
      ...backup,
      encryption: {
        ...backup.encryption,
        salt: "%%%not-base64%%%",
      },
    };

    await expect(
      BackupEncryptionService.decrypt(modifiedBackup, password)
    ).rejects.toThrow("Invalid backup encryption metadata.");
  });


  it("rejects encryption passwords shorter than 12 characters", async () => {
    await expect(
      BackupEncryptionService.encrypt({ test: "data" }, "short")
    ).rejects.toThrow("Backup encryption password must contain at least 12 characters.");
  });
});
