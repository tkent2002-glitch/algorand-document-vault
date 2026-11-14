import type { BackupIntegrityMetadata } from "./BackupIntegrityService";
import { BackupIntegrityService } from "./BackupIntegrityService";
import type { EvidenceBackupFile } from "./EvidenceBackupValidationService";
import { EvidenceBackupValidationService } from "./EvidenceBackupValidationService";
import { MerkleTreeService } from "../merkle";

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

    let membershipProofsVerified = true;
    if (validation.valid && backup.schema === "adv-evidence-backup-v2") {
      const verificationResults = await Promise.all(
        backup.batchMembers.map((member) =>
          MerkleTreeService.verify(member.membershipProof)
        )
      );
      membershipProofsVerified = verificationResults.every(Boolean);
      if (!membershipProofsVerified) {
        errors.push("One or more Merkle membership proofs failed verification.");
      }
    }

    return {
      valid:
        validation.valid &&
        integrityPresent &&
        integrityVerified &&
        membershipProofsVerified,
      structureValid: validation.valid,
      integrityPresent,
      integrityVerified,
      errors,
    };
  }
}



