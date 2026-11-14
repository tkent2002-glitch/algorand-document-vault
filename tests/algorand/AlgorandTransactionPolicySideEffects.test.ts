import { describe, expect, it } from "vitest";
import algosdk from "algosdk";
import { AlgorandTransactionPolicyService } from "../../src/services/algorand/AlgorandTransactionPolicyService";

const TEST_ACCOUNT = algosdk.generateAccount();
const OTHER_ACCOUNT = algosdk.generateAccount();

const EXPECTED_NOTE = new TextEncoder().encode(
  "adv-test-proof"
);

function createApprovedTransaction() {
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: TEST_ACCOUNT.addr,
    receiver: TEST_ACCOUNT.addr,
    amount: 0,
    note: EXPECTED_NOTE,
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

describe("AlgorandTransactionPolicyService side-effect boundaries", () => {
  it("rejects close remainder behavior", () => {
    const transaction = createApprovedTransaction();

    Object.defineProperty(
      transaction.payment!,
      "closeRemainderTo",
      {
        value: OTHER_ACCOUNT.addr,
        configurable: true,
      }
    );

    const result = validate(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction must not close the sender account balance."
    );
  });

  it("rejects account rekey behavior", () => {
    const transaction = createApprovedTransaction();

    Object.defineProperty(transaction, "rekeyTo", {
      value: OTHER_ACCOUNT.addr,
      configurable: true,
    });

    const result = validate(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction must not rekey the sender account."
    );
  });

  it("rejects transaction grouping", () => {
    const transaction = createApprovedTransaction();

    transaction.group = new Uint8Array(32);

    const result = validate(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction must not belong to a transaction group."
    );
  });

  it("rejects transaction lease behavior", () => {
    const transaction = createApprovedTransaction();

    Object.defineProperty(transaction, "lease", {
      value: new Uint8Array(32),
      configurable: true,
    });

    const result = validate(transaction);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "ADv proof transaction must not contain a transaction lease."
    );
  });
});
