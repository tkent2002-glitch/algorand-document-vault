import { describe, expect, it } from "vitest";
import { MerkleTreeService } from "../../src/services/merkle";
import { BatchEvidenceRecordService } from "../../src/services/notarization/BatchEvidenceRecordService";
import { NotarizationService } from "../../src/services/notarization/NotarizationService";

const HASH =
  "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";

describe("BatchEvidenceRecordService", () => {
  it("binds local metadata to canonical Merkle members", async () => {
    const merkleBatch = await MerkleTreeService.build([HASH]);
    const proof = NotarizationService.createMerkleBatchProof(
      merkleBatch.root,
      1
    );
    const draft = BatchEvidenceRecordService.createDraft(
      merkleBatch,
      [
        {
          sourceIndex: 0,
          documentName: "private-name.txt",
          size: 1,
          lastModified: 10,
          hashAlgorithm: "SHA-256",
          hashValue: HASH,
        },
      ],
      proof
    );

    expect(draft.batch).toMatchObject({
      merkleRoot: merkleBatch.root,
      leafCount: 1,
      status: "draft",
    });
    expect(draft.members[0]).toMatchObject({
      batchId: draft.batch.id,
      documentName: "private-name.txt",
      hashValue: HASH,
    });
    expect(JSON.stringify(draft.batch.proof)).not.toContain("private-name");
  });
});
