import { describe, expect, it } from "vitest";
import algosdk from "algosdk";
import { AlgorandProofTransactionValidationService } from "../../src/services/algorand/AlgorandProofTransactionValidationService";

const TEST_ACCOUNT = algosdk.generateAccount();
const OTHER_ACCOUNT = algosdk.generateAccount();
const EXPECTED_NOTE = new TextEncoder().encode("adv-test-proof");

function createTransaction(receiver = TEST_ACCOUNT.addr) {
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: TEST_ACCOUNT.addr,
    receiver,
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

describe("AlgorandProofTransactionValidationService", () => {
  it("accepts signed bytes only when the transaction matches the prepared proof", () => {
    const transaction = createTransaction();

    const decoded =
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: transaction.signTxn(TEST_ACCOUNT.sk),
        expectedTransactionId: transaction.txID(),
        expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
        expectedNote: EXPECTED_NOTE,
      });

    expect(decoded.txID()).toBe(transaction.txID());
  });

  it("rejects malformed wallet output", () => {
    expect(() =>
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: new Uint8Array([1, 2, 3]),
        expectedTransactionId: "EXPECTED-TX-ID",
        expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
        expectedNote: EXPECTED_NOTE,
      })
    ).toThrow("malformed signed transaction");
  });

  it("rejects multiple concatenated signed transactions", () => {
    const transaction = createTransaction();
    const signed = transaction.signTxn(TEST_ACCOUNT.sk);
    const concatenated = new Uint8Array(signed.byteLength * 2);
    concatenated.set(signed);
    concatenated.set(signed, signed.byteLength);

    expect(() =>
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: concatenated,
        expectedTransactionId: transaction.txID(),
        expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
        expectedNote: EXPECTED_NOTE,
      })
    ).toThrow("malformed signed transaction");
  });

  it("rejects a valid signature over a transaction the application did not prepare", () => {
    const expectedTransaction = createTransaction();
    const alteredTransaction = createTransaction(OTHER_ACCOUNT.addr);

    expect(() =>
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: alteredTransaction.signTxn(TEST_ACCOUNT.sk),
        expectedTransactionId: expectedTransaction.txID(),
        expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
        expectedNote: EXPECTED_NOTE,
      })
    ).toThrow("receiver must equal the sender");
  });

  it("rejects an encoded transaction with no signature", () => {
    const transaction = createTransaction();
    const unsignedEnvelope =
      algosdk.encodeUnsignedSimulateTransaction(transaction);

    expect(() =>
      AlgorandProofTransactionValidationService.decodeAndValidateSignedTransaction({
        signedTransaction: unsignedEnvelope,
        expectedTransactionId: transaction.txID(),
        expectedSenderAddress: TEST_ACCOUNT.addr.toString(),
        expectedNote: EXPECTED_NOTE,
      })
    ).toThrow("without a signature");
  });
});
