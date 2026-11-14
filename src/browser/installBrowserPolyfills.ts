import { Buffer } from "buffer";

type BrowserGlobals = {
  Buffer?: typeof Buffer;
};

export function installBrowserPolyfills(
  target: BrowserGlobals = globalThis as BrowserGlobals
): void {
  target.Buffer ??= Buffer;
}
