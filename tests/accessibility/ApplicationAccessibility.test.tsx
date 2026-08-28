// @vitest-environment jsdom

import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import UploadStep from "../../src/pages/NotarizePage/components/UploadStep";

vi.mock("@perawallet/connect", () => ({
  PeraWalletConnect: class {
    isConnected = false;

    async connect() {
      return [];
    }

    async reconnectSession() {
      return [];
    }

    async disconnect() {
      return undefined;
    }

    async signTransaction() {
      return [];
    }
  },
}));

describe("application accessibility boundaries", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("exposes the active page and moves focus after navigation", async () => {
    render(<App />);

    const dashboard = screen.getByRole("button", {
      name: "Dashboard",
    });
    const verify = screen.getByRole("button", {
      name: "Verify",
    });

    expect(dashboard).toHaveAttribute("aria-current", "page");
    expect(verify).not.toHaveAttribute("aria-current");

    fireEvent.click(verify);

    await waitFor(() => {
      expect(document.title).toBe(
        "Verify | Algorand Document Vault"
      );
      expect(screen.getByRole("main")).toHaveFocus();
    });

    expect(verify).toHaveAttribute("aria-current", "page");
    expect(
      await screen.findByLabelText("Document to verify")
    ).toHaveAttribute("type", "file");
  });

  it("keeps the viewport stable after pointer navigation", async () => {
    render(<App />);

    const main = screen.getByRole("main");
    const focus = vi.spyOn(main, "focus");

    fireEvent.click(
      screen.getByRole("button", { name: "Verify" }),
      { detail: 1 }
    );

    await waitFor(() => {
      expect(document.title).toBe(
        "Verify | Algorand Document Vault"
      );
      expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    expect(main).toHaveFocus();
  });

  it("provides a keyboard skip link to the main landmark", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: "Skip to main content" })
    ).toHaveAttribute("href", "#main-content");
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("labels the notarization file input", () => {
    render(<UploadStep onFileChange={vi.fn()} />);

    expect(
      screen.getByLabelText("Document to notarize")
    ).toHaveAttribute("type", "file");
  });

  it("labels Vault controls without nesting main landmarks", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Vault" }));

    expect(
      await screen.findByLabelText(
        "Search evidence by filename or fingerprint"
      )
    ).toHaveAttribute("type", "search");
    expect(
      screen.getByLabelText("Filter evidence by status")
    ).toHaveValue("all");
    expect(
      screen.getByLabelText("Evidence Vault backup file")
    ).toHaveAttribute("type", "file");
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("keeps the backup status region mounted when validation updates", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Vault" }));

    const exportButton = await screen.findByRole("button", {
      name: "Export Encrypted Backup",
    });
    const statusRegion = screen.getByRole("status");

    expect(statusRegion).toBeEmptyDOMElement();
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
    expect(statusRegion).toHaveAttribute("aria-atomic", "true");

    fireEvent.click(exportButton);

    expect(statusRegion).toHaveTextContent(
      "Password must contain at least 12 characters."
    );
    expect(screen.getByRole("status")).toBe(statusRegion);
  });
});
