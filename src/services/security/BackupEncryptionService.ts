export class BackupEncryptionService {
  static readonly algorithm = "AES-GCM";
  static readonly keyDerivation = "PBKDF2-SHA-256";
  static readonly status = "foundation-only";
}
