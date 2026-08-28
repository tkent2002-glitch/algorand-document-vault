import type { BackupIntegrityMetadata } from "./BackupIntegrityService";
import { BackupIntegrityService } from "./BackupIntegrityService";
import type { EvidenceBackupFile } from "./EvidenceBackupValidationService";
import { EvidenceBackupValidationService } from "./EvidenceBackupValidationService";

export type IntegrityProtectedEvidenceBackupFile = EvidenceBackupFile & {
  integrity?: BackupIntegrityMetadata;
};

export type BackupIntegrityValidationResult = {
  valid: boolean;
  structureValid: boolean;
  integrityPresent: boolean;
  integrityVerified: boolean;
  errors: string[];
};

function removeIntegrity(
  backup: IntegrityProtectedEvidenceBackupFile
): EvidenceBackupFile {
  const payload = { ...backup };
  delete payload.integrity;

  return payload;
}

export class BackupIntegrityValidationService {
  static async evaluate(
    backup: IntegrityProtectedEvidenceBackupFile
  ): Promise<BackupIntegrityValidationResult> {
    const validation = EvidenceBackupValidationService.validate(backup);
    const errors = [...validation.errors];

    const integrityPresent = Boolean(backup.integrity);

    if (!integrityPresent) {
      errors.push("Backup integrity metadata is missing.");
    }

    const integrityVerified = backup.integrity
      ? await BackupIntegrityService.verifyIntegrity(
          removeIntegrity(backup),
          backup.integrity
        )
      : false;

    if (integrityPresent && !integrityVerified) {
      errors.push("Backup integrity verification failed.");
    }

    return {
      valid:
        validation.valid &&
        integrityPresent &&
        integrityVerified,
      structureValid: validation.valid,
      integrityPresent,
      integrityVerified,
      errors,
    };
  }
}



