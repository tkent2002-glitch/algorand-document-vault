export class SecureRandomService {
  static randomBytes(length: number): Uint8Array {
    if (!Number.isInteger(length) || length <= 0) {
      throw new Error("Random byte length must be a positive integer.");
    }

    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);

    return bytes;
  }
}
