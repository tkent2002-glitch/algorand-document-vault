export type BackupIntegrityMetadata = {
  algorithm: "SHA-256";
  digest: string;
};

export class BackupIntegrityService {
  static async createDigest(payload: unknown): Promise<string> {
    const canonicalJson = JSON.stringify(payload);
    const data = new TextEncoder().encode(canonicalJson);
    const digestBuffer = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(digestBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  static async createIntegrity(payload: unknown): Promise<BackupIntegrityMetadata> {
    return {
      algorithm: "SHA-256",
      digest: await this.createDigest(payload),
    };
  }

  static async verifyIntegrity(
    payload: unknown,
    integrity: BackupIntegrityMetadata
  ): Promise<boolean> {
    if (integrity.algorithm !== "SHA-256") {
      return false;
    }

    const digest = await this.createDigest(payload);

    return digest === integrity.digest;
  }
}
