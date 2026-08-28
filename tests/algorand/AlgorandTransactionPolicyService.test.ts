import { describe, expect, it } from "vitest";
import algosdk from "algosdk";
import { AlgorandTransactionPolicyService } from "../../src/services/algorand/AlgorandTransactionPolicyService";

const TEST_ACCOUNT = algosdk.generateAccount();
const OTHER_ACCOUNT = algosdk.generateAccount();

const EXPECTED_NOTE = new TextEncoder().encode(
  "adv-test-proof"
);

function createTransaction(options?: {
  receiver?: string;
  amount?: number;
  fee?: number;
  genesisID?: string;
  note?: Uint8Array;
}) {
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: TEST_ACCOUNT.addr,
    receiver: options?.receiver ?? TEST_ACCOUNT.addr,
    amount: options?.amount ?? 0,
    note: options?.note ?? EXPECTED_NOTE,
    suggestedParams: {
      fee: BigInt(options?.fee ?? 1000),
      minFee: 1000n,
      firstValid: 1n,
      lastValid: 1001n,
      genesisID: options?.genesisID ?? "testnet-v1.0",
      genesisHash: new Uint8Array(32),
      flatFee: true,
    },
  });
}

function validate(
  transaction: ReturnType<
    typeof algosdk.makePaymentTxnWithSuggestedParamsFromObject
  >
) {
  return AlgorandTransactionPolicyService.validate({
    transaction,
    expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
    expectedNote: EXPECTED_NOTE,
  });
}

describe("AlgorandTransactionPolicyService", () => {
  it("accepts the approved ADv proof transaction shape", () => {
    const result = validate(createTransaction());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a transaction that sends ALGO to another address", () => {
    const result = validate(
      createTransaction({
        receiver: OTHER_ACCOUNT.addr.toString(),
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction receiver must equal the sender."
    );
  });

  it("rejects a nonzero payment amount", () => {
    const result = validate(
      createTransaction({
        amount: 1,
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction must transfer zero microAlgos."
    );
  });

  it("rejects an altered proof note", () => {
    const result = validate(
      createTransaction({
        note: new TextEncoder().encode("altered-proof"),
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Transaction note does not match the canonical ADv proof payload."
    );
  });

  it("rejects a transaction for the wrong genesis", () => {
    const result = validate(
      createTransaction({
        genesisID: "mainnet-v1.0",
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Transaction is not configured for the approved Algorand TestNet genesis."
    );
  });

  it("rejects an unexpected transaction fee", () => {
    const result = validate(
      createTransaction({
        fee: 2000,
      })
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Transaction fee does not match the approved ADv proof transaction fee."
    );
  });
});
