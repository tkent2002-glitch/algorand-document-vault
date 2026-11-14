import algosdk from "algosdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AlgorandProofNoteService } from "../../src/services/algorand/AlgorandProofNoteService";
import { AlgorandService } from "../../src/services/algorand/AlgorandService";
import type { EvidenceRecord } from "../../src/services/notarization";
import { NotarizationService } from "../../src/services/notarization";
import { ShareableVerificationProofService } from "../../src/services/shareable-proof";

const HASH =
  "0a69773de57196532ae089e3f221bdc5261930a71ee90d8f63c5df4691f04134";
const CONFIRMED_ROUND = 66826566;
const TEST_ACCOUNT = algosdk.generateAccount();

function createTransaction(noteHash = HASH) {
  const proof = NotarizationService.createProof({
    algorithm: "SHA-256",
    value: noteHash,
  });

  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: TEST_ACCOUNT.addr,
    receiver: TEST_ACCOUNT.addr,
    amount: 0,
    note: AlgorandProofNoteService.createNote(proof),
    suggestedParams: {
      fee: 1000n,
      minFee: 1000n,
      firstValid: 1n,
      lastValid: 1001n,
      genesisID: "testnet-v1.0",
      genesisHash: new Uint8Array(32),
      flatFee: true,
    },
  });
}

function createConfirmedRecord(
  transaction = createTransaction()
): EvidenceRecord {
  const proof = NotarizationService.createProof({
    algorithm: "SHA-256",
    value: HASH,
  });

  return {
    id: "d7c25398-b64a-480a-b385-ccfb7f147ef2",
    status: "confirmed",
    documentName: "deployment-smoke.txt",
    hashAlgorithm: "SHA-256",
    hashValue: HASH,
    proof,
    algorandTransactionId: transaction.txID(),
    confirmedRound: CONFIRMED_ROUND,
    confirmedAt: "2026-08-30T20:24:44.000Z",
    createdAt: "2026-08-30T20:23:47.000Z",
  };
}

function mockPendingTransaction(
  transaction = createTransaction(),
  confirmedRound = CONFIRMED_ROUND
) {
  const doRequest = vi.fn().mockResolvedValue({
    confirmedRound: BigInt(confirmedRound),
    poolError: "",
    txn: {
      txn: transaction,
    },
  });
  const pendingTransactionInformation = vi.fn().mockReturnValue({
    do: doRequest,
  });

  vi.spyOn(AlgorandService, "createAlgodClient").mockReturnValue({
    pendingTransactionInformation,
  } as unknown as algosdk.Algodv2);

  return {
    doRequest,
    pendingTransactionInformation,
  };
}

describe("ShareableVerificationProofService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a minimal integrity-protected proof without private Vault metadata", async () => {
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord()
    );
    const validation = await ShareableVerificationProofService.validate(proof);
    const serialized = JSON.stringify(proof);

    expect(validation.valid).toBe(true);
    expect(proof.schema).toBe("adv-shareable-verification-proof-v1");
    expect(proof.network).toBe("algorand-testnet");
    expect(proof.evidence.hashValue).toBe(HASH);
    expect(proof.evidence.confirmedRound).toBe(CONFIRMED_ROUND);
    expect(serialized).not.toContain("deployment-smoke.txt");
    expect(serialized).not.toContain("d7c25398-b64a-480a-b385-ccfb7f147ef2");
    expect(serialized).not.toContain(TEST_ACCOUNT.addr.toString());
  });

  it("refuses to export a record that is not confirmed", async () => {
    const record = {
      ...createConfirmedRecord(),
      status: "draft",
      algorandTransactionId: undefined,
      confirmedRound: undefined,
    } as EvidenceRecord;

    await expect(
      ShareableVerificationProofService.create(record)
    ).rejects.toThrow("confirmed Algorand evidence record");
  });

  it("rejects a proof whose protected receipt data was changed", async () => {
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord()
    );
    const tampered = {
      ...proof,
      evidence: {
        ...proof.evidence,
        confirmedRound: proof.evidence.confirmedRound + 1,
      },
    };

    const validation =
      await ShareableVerificationProofService.validate(tampered);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      "The shared proof integrity check failed."
    );
  });

  it("rejects unsupported fields instead of accepting hidden metadata", async () => {
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord()
    );
    const proofWithExtraMetadata = {
      ...proof,
      documentName: "must-not-be-accepted.pdf",
    };

    const validation = await ShareableVerificationProofService.validate(
      proofWithExtraMetadata
    );

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain(
      "The shared proof contains unsupported fields."
    );
  });

  it("verifies the document, canonical note, transaction policy, and round", async () => {
    const transaction = createTransaction();
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord(transaction)
    );
    const mock = mockPendingTransaction(transaction);

    const result = await ShareableVerificationProofService.verify(HASH, proof);

    expect(result.verified).toBe(true);
    expect(result.status).toBe("verified");
    expect(mock.pendingTransactionInformation).toHaveBeenCalledWith(
      transaction.txID()
    );
  });

  it("stops before a network lookup when the selected document does not match", async () => {
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord()
    );
    const createClient = vi.spyOn(AlgorandService, "createAlgodClient");

    const result = await ShareableVerificationProofService.verify(
      "1".repeat(64),
      proof
    );

    expect(result.status).toBe("document_mismatch");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("rejects an on-chain transaction with a different canonical note", async () => {
    const alteredTransaction = createTransaction("2".repeat(64));
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord(alteredTransaction)
    );
    mockPendingTransaction(alteredTransaction);

    const result = await ShareableVerificationProofService.verify(HASH, proof);

    expect(result.status).toBe("transaction_mismatch");
    expect(result.errors).toContain(
      "Transaction note does not match the canonical ADv proof payload."
    );
  });

  it("reports node failure as unavailable without declaring the proof invalid", async () => {
    const proof = await ShareableVerificationProofService.create(
      createConfirmedRecord()
    );
    const pendingTransactionInformation = vi.fn().mockReturnValue({
      do: vi.fn().mockRejectedValue(new Error("offline")),
    });

    vi.spyOn(AlgorandService, "createAlgodClient").mockReturnValue({
      pendingTransactionInformation,
    } as unknown as algosdk.Algodv2);

    const result = await ShareableVerificationProofService.verify(HASH, proof);

    expect(result.verified).toBe(false);
    expect(result.status).toBe("unavailable");
    expect(result.message).toContain("not been marked invalid");
  });
});
