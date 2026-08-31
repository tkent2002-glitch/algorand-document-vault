import type { EvidenceRecord } from "../notarization";
import {
  ShareableVerificationProofService,
  type ShareableVerificationProofFile,
} from "../shareable-proof";

const VERIFICATION_LINK_VERSION = "adv-verification-link-v1";
const VERIFICATION_HASH_PREFIX = "#verify=";
const MAX_DOCUMENT_LABEL_LENGTH = 180;

export type VerificationLinkEnvelope = {
  version: typeof VERIFICATION_LINK_VERSION;
  documentLabel: string;
  proof: ShareableVerificationProofFile;
};

export type VerificationLinkParseResult = {
  valid: boolean;
  envelope: VerificationLinkEnvelope | null;
  errors: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: string[]
): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function isValidDocumentLabel(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_DOCUMENT_LABEL_LENGTH &&
    !Array.from(value).some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 31 || codePoint === 127;
    })
  );
}

function encodeUtf8Base64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/u, "");
}

function decodeUtf8Base64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const binary = atob(`${normalized}${"=".repeat(paddingLength)}`);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function normalizeBaseUrl(baseUrl: string): URL {
  const url = new URL(baseUrl);
  url.hash = "";
  url.search = "";
  url.pathname = "/";
  return url;
}

export class VerificationLinkService {
  static hasVerificationHash(hash: string): boolean {
    return hash.startsWith(VERIFICATION_HASH_PREFIX);
  }

  static async createEnvelope(
    record: EvidenceRecord
  ): Promise<VerificationLinkEnvelope> {
    const documentLabel = record.documentName.trim();

    if (!isValidDocumentLabel(documentLabel)) {
      throw new Error("The document name cannot be used as a verification label.");
    }

    return {
      version: VERIFICATION_LINK_VERSION,
      documentLabel,
      proof: await ShareableVerificationProofService.create(record),
    };
  }

  static serialize(envelope: VerificationLinkEnvelope): string {
    return encodeUtf8Base64Url(JSON.stringify(envelope));
  }

  static async createUrl(
    record: EvidenceRecord,
    baseUrl = window.location.href
  ): Promise<string> {
    const envelope = await this.createEnvelope(record);
    const url = normalizeBaseUrl(baseUrl);
    url.hash = `verify=${this.serialize(envelope)}`;
    return url.toString();
  }

  static async parseHash(hash: string): Promise<VerificationLinkParseResult> {
    if (!this.hasVerificationHash(hash)) {
      return {
        valid: false,
        envelope: null,
        errors: ["No verification link was found."],
      };
    }

    try {
      const encoded = hash.slice(VERIFICATION_HASH_PREFIX.length);
      const value: unknown = JSON.parse(decodeUtf8Base64Url(encoded));

      if (!isRecord(value)) {
        throw new Error("The verification link payload is not an object.");
      }

      if (!hasOnlyKeys(value, ["version", "documentLabel", "proof"])) {
        throw new Error("The verification link contains unsupported fields.");
      }

      if (value.version !== VERIFICATION_LINK_VERSION) {
        throw new Error("The verification link version is not supported.");
      }

      if (!isValidDocumentLabel(value.documentLabel)) {
        throw new Error("The verification link document label is invalid.");
      }

      const proofValidation =
        await ShareableVerificationProofService.validate(value.proof);

      if (!proofValidation.valid || !proofValidation.proof) {
        return {
          valid: false,
          envelope: null,
          errors: proofValidation.errors,
        };
      }

      return {
        valid: true,
        envelope: {
          version: VERIFICATION_LINK_VERSION,
          documentLabel: value.documentLabel,
          proof: proofValidation.proof,
        },
        errors: [],
      };
    } catch (error) {
      return {
        valid: false,
        envelope: null,
        errors: [
          error instanceof Error
            ? error.message
            : "The verification link could not be read.",
        ],
      };
    }
  }
}
