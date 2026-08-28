import { Buffer } from "buffer";
import { describe, expect, it } from "vitest";
import { installBrowserPolyfills } from "../../src/browser/installBrowserPolyfills";

describe("installBrowserPolyfills", () => {
  it("installs a browser-safe Buffer implementation", () => {
    const target: { Buffer?: typeof Buffer } = {};

    installBrowserPolyfills(target);

    expect(target.Buffer).toBe(Buffer);
    expect(target.Buffer?.from("vault").toString("base64")).toBe(
      "dmF1bHQ="
    );
  });

  it("preserves an existing Buffer implementation", () => {
    const existing = class ExistingBuffer {};
    const target = {
      Buffer: existing as unknown as typeof Buffer,
    };

    installBrowserPolyfills(target);

    expect(target.Buffer).toBe(existing);
  });
});
