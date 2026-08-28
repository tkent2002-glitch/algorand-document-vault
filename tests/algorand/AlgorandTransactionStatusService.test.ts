import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlgorandService } from "../../src/services/algorand/AlgorandService";
import { AlgorandTransactionStatusService } from "../../src/services/algorand/AlgorandTransactionStatusService";

function mockPendingLookup(
  result: unknown
) {
  const doMock = vi.fn().mockResolvedValue(result);

  const pendingTransactionInformation = vi.fn().mockReturnValue({
    do: doMock,
  });

  vi.spyOn(
    AlgorandService,
    "createAlgodClient"
  ).mockReturnValue({
    pendingTransactionInformation,
  } as never);

  return {
    doMock,
    pendingTransactionInformation,
  };
}

function mockPendingLookupFailure(
  error: unknown
) {
  const doMock = vi.fn().mockRejectedValue(error);

  const pendingTransactionInformation = vi.fn().mockReturnValue({
    do: doMock,
  });

  vi.spyOn(
    AlgorandService,
    "createAlgodClient"
  ).mockReturnValue({
    pendingTransactionInformation,
  } as never);
}

describe("AlgorandTransactionStatusService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reports a confirmed transaction", async () => {
    mockPendingLookup({
      confirmedRound: 123456,
      poolError: "",
    });

    const result =
      await AlgorandTransactionStatusService.check(
        "TEST-TX-ID"
      );

    expect(result.status).toBe("confirmed");
    expect(result.confirmedRound).toBe(123456);
    expect(result.poolError).toBeNull();
  });

  it("reports a pending transaction", async () => {
    mockPendingLookup({
      confirmedRound: 0,
      poolError: "",
    });

    const result =
      await AlgorandTransactionStatusService.check(
        "TEST-TX-ID"
      );

    expect(result.status).toBe("pending");
    expect(result.confirmedRound).toBeNull();
  });

  it("reports a rejected transaction when pool error exists", async () => {
    mockPendingLookup({
      confirmedRound: 0,
      poolError: "overspend",
    });

    const result =
      await AlgorandTransactionStatusService.check(
        "TEST-TX-ID"
      );

    expect(result.status).toBe("rejected");
    expect(result.poolError).toBe("overspend");
  });

  it("reports not found only for a 404 response", async () => {
    mockPendingLookupFailure({
      response: {
        status: 404,
      },
    });

    const result =
      await AlgorandTransactionStatusService.check(
        "TEST-TX-ID"
      );

    expect(result.status).toBe("not_found");
    expect(result.message).toContain(
      "does not by itself prove"
    );
  });

  it("reports unavailable for network or unexpected errors", async () => {
    mockPendingLookupFailure(
      new Error("Failed to fetch")
    );

    const result =
      await AlgorandTransactionStatusService.check(
        "TEST-TX-ID"
      );

    expect(result.status).toBe("unavailable");
  });

  it("rejects an empty transaction id", async () => {
    await expect(
      AlgorandTransactionStatusService.check("   ")
    ).rejects.toThrow(
      "Transaction ID is required for status verification."
    );
  });

  it("normalizes whitespace around transaction ids", async () => {
    const mock = mockPendingLookup({
      confirmedRound: 10,
      poolError: "",
    });

    const result =
      await AlgorandTransactionStatusService.check(
        "  TEST-TX-ID  "
      );

    expect(result.transactionId).toBe("TEST-TX-ID");

    expect(
      mock.pendingTransactionInformation
    ).toHaveBeenCalledWith("TEST-TX-ID");
  });
});
