import assert from "node:assert/strict";
import test from "node:test";

import { validateReleaseReadiness } from "./verify-release-readiness.mjs";

function validInput() {
  return {
    packageJson: JSON.stringify({ version: "0.1.0-alpha" }),
    packageLock: JSON.stringify({
      version: "0.1.0-alpha",
      packages: { "": { version: "0.1.0-alpha" } },
    }),
    versionSource:
      'export const APP_VERSION = "0.1.0-alpha";\n' +
      'export const APP_STAGE = "Public Alpha Candidate";\n',
    networkSource:
      'network: "testnet",\n' +
      'algodServer: "https://testnet-api.algonode.cloud",\n',
    policySource:
      'const ALGORAND_TESTNET_GENESIS_ID = "testnet-v1.0";\n',
    changelog: "## [0.1.0-alpha] - Planned\n",
    productionSources: [{ path: "src/example.ts", contents: "export {};" }],
  };
}

test("accepts the approved alpha identity and TestNet-only boundary", () => {
  assert.deepEqual(validateReleaseReadiness(validInput()), []);
});

test("accepts a finalized ISO-dated alpha changelog heading", () => {
  const input = validInput();
  input.changelog = "## [0.1.0-alpha] - 2026-08-30\n";

  assert.deepEqual(validateReleaseReadiness(input), []);
});

test("rejects a changelog without the approved alpha heading", () => {
  const input = validInput();
  input.changelog = "## [Unreleased]\n";

  assert.match(
    validateReleaseReadiness(input).join("\n"),
    /planned or ISO-dated alpha release heading/
  );
});

test("rejects release identity drift", () => {
  const input = validInput();
  input.packageJson = JSON.stringify({ version: "0.1.0" });

  assert.match(validateReleaseReadiness(input).join("\n"), /package\.json version/);
});

test("rejects a production MainNet endpoint", () => {
  const input = validInput();
  input.productionSources.push({
    path: "src/network.ts",
    contents: 'const endpoint = "https://mainnet-api.algonode.cloud";',
  });

  assert.match(
    validateReleaseReadiness(input).join("\n"),
    /Production source contains a MainNet endpoint: src\/network\.ts/
  );
});
