export class HashService {
  static async sha256FromFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    return this.sha256FromArrayBuffer(buffer);
  }

  static async sha256FromArrayBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return this.arrayBufferToHex(hashBuffer);
  }

  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = Array.from(new Uint8Array(buffer));

    return bytes
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}
