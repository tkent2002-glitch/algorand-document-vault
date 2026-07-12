export type EncryptedBackupAlgorithm = "AES-GCM";
export type BackupKeyDerivationAlgorithm = "PBKDF2-SHA-256";

export type EncryptedBackupMetadata = {
  algorithm: EncryptedBackupAlgorithm;
  keyDerivation: BackupKeyDerivationAlgorithm;
  iterations: number;
  salt: string;
  iv: string;
};

export type EncryptedEvidenceBackupFile = {
  schema: "adv-encrypted-evidence-backup-v1";
  exportedAt: string;
  encryption: EncryptedBackupMetadata;
  ciphertext: string;
};
