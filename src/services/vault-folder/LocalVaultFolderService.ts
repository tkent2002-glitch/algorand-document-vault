import type { EvidenceRecord } from "../notarization";
import { ShareableVerificationProofService } from "../shareable-proof";

const VAULT_FOLDER_NAME = "Algorand Document Vault";
const DOCUMENTS_FOLDER_NAME = "Documents";
const PROOFS_FOLDER_NAME = "Verification Proofs";

type WritableFileStreamLike = {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
};

type WritableFileHandleLike = {
  createWritable(): Promise<WritableFileStreamLike>;
};

type WritableDirectoryHandleLike = {
  getDirectoryHandle(
    name: string,
    options: { create: boolean }
  ): Promise<WritableDirectoryHandleLike>;
  getFileHandle(
    name: string,
    options: { create: boolean }
  ): Promise<WritableFileHandleLike>;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options: {
    id: string;
    mode: "readwrite";
    startIn: "documents";
  }) => Promise<WritableDirectoryHandleLike>;
};

export type LocalVaultSaveResult =
  | {
      method: "directory";
      message: string;
    }
  | {
      method: "share";
      message: string;
    }
  | {
      method: "unsupported";
      message: string;
    };

function safeFileName(value: string): string {
  const withoutControlCharacters = Array.from(value, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 31 || codePoint === 127 ? "-" : character;
  }).join("");
  const normalized = withoutControlCharacters
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/[. ]+$/u, "")
    .trim();

  return normalized || "document";
}

function proofFileName(documentName: string): string {
  const safeName = safeFileName(documentName);
  const lastDot = safeName.lastIndexOf(".");
  const baseName = lastDot > 0 ? safeName.slice(0, lastDot) : safeName;
  return `${baseName}.verification-proof.json`;
}

async function writeFile(
  directory: WritableDirectoryHandleLike,
  fileName: string,
  blob: Blob
): Promise<void> {
  const fileHandle = await directory.getFileHandle(fileName, { create: true });
  const stream = await fileHandle.createWritable();
  await stream.write(blob);
  await stream.close();
}

export class LocalVaultFolderService {
  static isDirectoryPickerSupported(): boolean {
    return typeof (window as DirectoryPickerWindow).showDirectoryPicker === "function";
  }

  static async createProofFile(record: EvidenceRecord): Promise<File> {
    const proof = await ShareableVerificationProofService.create(record);
    return new File(
      [JSON.stringify(proof, null, 2)],
      proofFileName(record.documentName),
      { type: "application/json" }
    );
  }

  static async savePackage(
    record: EvidenceRecord,
    originalDocument: File
  ): Promise<LocalVaultSaveResult> {
    const proofFile = await this.createProofFile(record);
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;

    if (picker) {
      const parentDirectory = await picker({
        id: "algorand-document-vault",
        mode: "readwrite",
        startIn: "documents",
      });
      const vaultDirectory = await parentDirectory.getDirectoryHandle(
        VAULT_FOLDER_NAME,
        { create: true }
      );
      const documentsDirectory = await vaultDirectory.getDirectoryHandle(
        DOCUMENTS_FOLDER_NAME,
        { create: true }
      );
      const proofsDirectory = await vaultDirectory.getDirectoryHandle(
        PROOFS_FOLDER_NAME,
        { create: true }
      );

      await writeFile(
        documentsDirectory,
        safeFileName(originalDocument.name),
        originalDocument
      );
      await writeFile(proofsDirectory, proofFile.name, proofFile);

      return {
        method: "directory",
        message:
          "The document and verification proof were saved in the Algorand Document Vault folder.",
      };
    }

    if (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [originalDocument, proofFile] })
    ) {
      await navigator.share({
        title: "Algorand document verification files",
        text: "Save or send the original document and its verification proof together.",
        files: [originalDocument, proofFile],
      });

      return {
        method: "share",
        message:
          "The document and verification proof were sent to your device's share or Files menu.",
      };
    }

    return {
      method: "unsupported",
      message:
        "This browser cannot save both files to a chosen folder. Keep the original document and download its verification proof separately.",
    };
  }
}
