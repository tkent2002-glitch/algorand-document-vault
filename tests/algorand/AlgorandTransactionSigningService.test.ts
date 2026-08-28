import { beforeEach, describe, expect, it, vi } from "vitest";
import algosdk from "algosdk";
import type { NotarizationProof } from "../../src/types";
import { AlgorandService } from "../../src/services/algorand/AlgorandService";
import { AlgorandTransactionSigningService } from "../../src/services/algorand/AlgorandTransactionSigningService";
import { WalletService } from "../../src/services/wallet/WalletService";

const TEST_ACCOUNT = algosdk.generateAccount();

const PROOF: NotarizationProof = {
  payload: {
    appId: "algorand-document-vault",
    schemaVersion: "1.0",
    hash: {
      algorithm: "SHA-256",
      value:
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
  },
  status: "pending_wallet_signature",
  createdAt: "2026-07-12T00:00:00.000Z",
};

describe("AlgorandTransactionSigningService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call the wallet signer when transaction policy rejects the constructed transaction", async () => {
    vi.spyOn(
      AlgorandService,
      "createAlgodClient"
    ).mockReturnValue({
      getTransactionParams: () => ({
        do: async () => ({
          fee: 2000n,
          minFee: 1000n,
          firstValid: 1n,
          lastValid: 1001n,
          genesisID: "testnet-v1.0",
          genesisHash: new Uint8Array(32),
          flatFee: true,
        }),
      }),
    } as never);

    const signerSpy = vi
      .spyOn(WalletService, "signSingleTransaction")
      .mockResolvedValue(new Uint8Array([1, 2, 3]));

    await expect(
      AlgorandTransactionSigningService.signProofTransaction(
        PROOF,
        TEST_ACCOUNT.addr.toString()
      )
    ).rejects.toThrow(
      "Algorand transaction rejected by ADv policy: Transaction fee does not match the approved ADv proof transaction fee."
    );

    expect(signerSpy).not.toHaveBeenCalled();
  });
});
