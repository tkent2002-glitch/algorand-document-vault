// @vitest-environment jsdom

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

vi.mock("../../src/pages/NotarizePage/NotarizePage", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  function MockNotarizePage({
    onCompletionChange,
  }: {
    onCompletionChange?: (complete: boolean) => void;
  }) {
    const [complete, setComplete] = React.useState(false);

    React.useEffect(() => {
      onCompletionChange?.(complete);
    }, [complete, onCompletionChange]);

    return (
      <section>
        <h2>{complete ? "Notarization Receipt" : "Notarize Document"}</h2>
        {!complete && (
          <>
            <label htmlFor="draft-marker">Draft marker</label>
            <input id="draft-marker" />
            <button type="button" onClick={() => setComplete(true)}>
              Complete notarization
            </button>
          </>
        )}
      </section>
    );
  }

  return {
    default: MockNotarizePage,
  };
});

describe("active Notarize navigation", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts a fresh Notarize session when the completed tab is selected", async () => {
    render(<App />);

    const notarizeTab = screen.getByRole("button", {
      name: "Notarize",
    });

    fireEvent.click(notarizeTab);
    expect(
      await screen.findByRole("heading", { name: "Notarize Document" })
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Complete notarization" })
    );
    expect(
      await screen.findByRole("heading", { name: "Notarization Receipt" })
    ).toBeVisible();

    await waitFor(() =>
      expect(notarizeTab).toHaveAttribute("aria-current", "page")
    );
    fireEvent.click(notarizeTab);

    expect(
      await screen.findByRole("heading", { name: "Notarize Document" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Complete notarization" })
    ).toBeVisible();
  });

  it("preserves an unfinished Notarize session when its active tab is selected", async () => {
    render(<App />);

    const notarizeTab = screen.getByRole("button", {
      name: "Notarize",
    });
    fireEvent.click(notarizeTab);

    const draftMarker = await screen.findByLabelText("Draft marker");
    fireEvent.change(draftMarker, { target: { value: "keep this draft" } });
    fireEvent.click(notarizeTab);

    expect(screen.getByLabelText("Draft marker")).toHaveValue(
      "keep this draft"
    );
  });
});
