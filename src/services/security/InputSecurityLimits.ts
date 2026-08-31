export const INPUT_SECURITY_LIMITS = Object.freeze({
  backupFileBytes: 20 * 1024 * 1024,
  backupRecords: 10_000,
  backupValidationErrors: 100,
  documentNameCharacters: 255,
  encryptedCiphertextCharacters: 20 * 1024 * 1024,
  jsonNestingDepth: 32,
  jsonNodes: 250_000,
  passwordCharacters: 1_024,
  recordIdentifierCharacters: 128,
  sharedProofFileBytes: 64 * 1024,
  transactionIdentifierCharacters: 128,
  verificationLinkCharacters: 16 * 1024,
});

export function formatByteLimit(bytes: number): string {
  if (bytes % (1024 * 1024) === 0) {
    return `${bytes / (1024 * 1024)} MB`;
  }

  return `${bytes / 1024} KB`;
}
