export const CURRENT_BACKUP_PBKDF2_ITERATIONS = 600_000;
export const LEGACY_BACKUP_PBKDF2_ITERATIONS = 250_000;

const SUPPORTED_BACKUP_PBKDF2_ITERATIONS = new Set([
  CURRENT_BACKUP_PBKDF2_ITERATIONS,
  LEGACY_BACKUP_PBKDF2_ITERATIONS,
]);

export function isSupportedBackupPbkdf2Iterations(
  iterations: number
): boolean {
  return (
    Number.isSafeInteger(iterations) &&
    SUPPORTED_BACKUP_PBKDF2_ITERATIONS.has(iterations)
  );
}
