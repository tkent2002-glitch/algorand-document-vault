// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShareVerificationActions from "../../src/components/verification/ShareVerificationActions";
import type { EvidenceRecord } from "../../src/services/notarization";
import { VerificationLinkService } from "../../src/services/verification-link";

const RECORD = {
  id: "auto-link-record",
  status: "confirmed",
  documentName: "test 7 link test.txt",
} as EvidenceRecord;

describe("ShareVerificationActions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("prepares and remembers a confirmed document link automatically", async () => {
    const createUrl = vi
      .spyOn(VerificationLinkService, "createUrl")
      .mockResolvedValue("https://vault.example/#verify=record");

    const firstRender = render(<ShareVerificationActions record={RECORD} />);

    expect(await screen.findByText("Verification link ready")).toBeVisible();
    expect(screen.getByRole("button", { name: "Copy link" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Show link" }));
    expect(screen.getByLabelText("Verification link")).toHaveValue(
      "https://vault.example/#verify=record"
    );

    firstRender.unmount();
    render(<ShareVerificationActions record={RECORD} />);

    expect(screen.getByText("Verification link ready")).toBeVisible();
    expect(createUrl).toHaveBeenCalledTimes(1);
  });
});
