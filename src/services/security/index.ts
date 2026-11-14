export { BackupEncryptionService } from "./BackupEncryptionService";
export {
  CURRENT_BACKUP_PBKDF2_ITERATIONS,
  LEGACY_BACKUP_PBKDF2_ITERATIONS,
  isSupportedBackupPbkdf2Iterations,
} from "./BackupEncryptionParameters";
export { KeyDerivationService } from "./KeyDerivationService";
export { SecureRandomService } from "./SecureRandomService";

export type { DerivedKeyResult } from "./KeyDerivationService";

export type {
  BackupKeyDerivationAlgorithm,
  EncryptedBackupAlgorithm,
  EncryptedBackupMetadata,
  EncryptedEvidenceBackupFile,
} from "./EncryptionTypes";

export {
  INPUT_SECURITY_LIMITS,
  formatByteLimit,
} from "./InputSecurityLimits";
