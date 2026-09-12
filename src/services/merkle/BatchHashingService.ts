import { HashService } from "../crypto";
import { INPUT_SECURITY_LIMITS } from "../security/InputSecurityLimits";

export type BatchHashingProgress = {
  completedFiles: number;
  totalFiles: number;
  currentFileName: string;
};

export type BatchHashedDocument = {
  sourceIndex: number;
  documentName: string;
  size: number;
  lastModified: number;
  hashAlgorithm: "SHA-256";
  hashValue: string;
};

export type BatchHashingOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: BatchHashingProgress) => void;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Batch hashing was cancelled.", "AbortError");
  }
}

function validateFiles(files: readonly File[]): void {
  if (
    files.length === 0 ||
    files.length > INPUT_SECURITY_LIMITS.merkleBatchFiles
  ) {
    throw new Error(
      `Select between 1 and ${INPUT_SECURITY_LIMITS.merkleBatchFiles.toLocaleString()} files for a batch.`
    );
  }

  let totalBytes = 0;

  for (const file of files) {
    if (file.size === 0) {
      throw new Error(`${file.name || "A selected file"} is empty.`);
    }

    if (file.name.length > INPUT_SECURITY_LIMITS.documentNameCharacters) {
      throw new Error("A selected filename exceeds the supported length.");
    }

    if (file.size > INPUT_SECURITY_LIMITS.merkleBatchFileBytes) {
      throw new Error(
        `${file.name} exceeds the per-file batch size limit.`
      );
    }

    totalBytes += file.size;
  }

  if (totalBytes > INPUT_SECURITY_LIMITS.merkleBatchTotalBytes) {
    throw new Error("The selected files exceed the total batch size limit.");
  }
}

export class BatchHashingService {
  static async hashFiles(
    files: readonly File[],
    options: BatchHashingOptions = {}
  ): Promise<BatchHashedDocument[]> {
    validateFiles(files);
    throwIfAborted(options.signal);

    const results: BatchHashedDocument[] = [];

    for (let sourceIndex = 0; sourceIndex < files.length; sourceIndex += 1) {
      const file = files[sourceIndex];
      throwIfAborted(options.signal);

      options.onProgress?.({
        completedFiles: sourceIndex,
        totalFiles: files.length,
        currentFileName: file.name,
      });

      const hashValue = await HashService.sha256FromFile(file);
      throwIfAborted(options.signal);

      results.push({
        sourceIndex,
        documentName: file.name,
        size: file.size,
        lastModified: file.lastModified,
        hashAlgorithm: "SHA-256",
        hashValue,
      });
    }

    options.onProgress?.({
      completedFiles: files.length,
      totalFiles: files.length,
      currentFileName: "",
    });

    return results;
  }
}
