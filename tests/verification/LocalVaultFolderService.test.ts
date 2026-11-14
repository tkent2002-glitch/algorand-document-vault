// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import type { EvidenceRecord } from "../../src/services/notarization";
import { ShareableVerificationProofService } from "../../src/services/shareable-proof";
import { LocalVaultFolderService } from "../../src/services/vault-folder";

const RECORD = {
  id: "record-1",
  status: "confirmed",
  documentName: "signed agreement.pdf",
} as EvidenceRecord;

describe("LocalVaultFolderService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker;
  });

  it("creates a clearly named proof file", async () => {
    vi.spyOn(ShareableVerificationProofService, "create").mockResolvedValue({
      schema: "adv-shareable-verification-proof-v1",
    } as never);

    const file = await LocalVaultFolderService.createProofFile(RECORD);

    expect(file.name).toBe("signed agreement.verification-proof.json");
    expect(file.type).toBe("application/json");
  });

  it("saves the document and proof into separate folders", async () => {
    vi.spyOn(ShareableVerificationProofService, "create").mockResolvedValue({
      schema: "adv-shareable-verification-proof-v1",
    } as never);
    const writes: Array<{ folder: string; name: string }> = [];
    const createDirectory = (folder: string) => ({
      getDirectoryHandle: vi.fn(async (name: string) => createDirectory(name)),
      getFileHandle: vi.fn(async (name: string) => ({
        createWritable: vi.fn(async () => ({
          write: vi.fn(async () => writes.push({ folder, name })),
          close: vi.fn(async () => undefined),
        })),
      })),
    });
    const selectedDirectory = createDirectory("selected");
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: vi.fn(async () => selectedDirectory),
    });

    const result = await LocalVaultFolderService.savePackage(
      RECORD,
      new File(["agreement"], "signed agreement.pdf", {
        type: "application/pdf",
      })
    );

    expect(result.method).toBe("directory");
    expect(writes).toEqual([
      { folder: "Documents", name: "signed agreement.pdf" },
      {
        folder: "Verification Proofs",
        name: "signed agreement.verification-proof.json",
      },
    ]);
  });
});
