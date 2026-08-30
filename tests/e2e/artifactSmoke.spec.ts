import { expect, test } from "@playwright/test";

test("boots the packaged artifact through a direct-load fallback with security headers", async ({
  page,
  request,
}) => {
  const browserProblems: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      browserProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => browserProblems.push(error.message));

  const response = await page.goto("/release-smoke/direct-load");

  expect(response?.status()).toBe(200);
  const contentSecurityPolicy =
    response?.headers()["content-security-policy"];

  expect(contentSecurityPolicy).toContain("default-src 'self'");
  expect(contentSecurityPolicy).toContain("wss://*.perawallet.app");
  expect(contentSecurityPolicy).toContain("wss://*.bridge.walletconnect.org");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");

  await expect(page).toHaveTitle("Dashboard | Algorand Document Vault");
  await expect(
    page.getByRole("heading", {
      name: "Cryptographic document integrity, anchored on Algorand.",
    })
  ).toBeVisible();

  const manifestResponse = await request.get("/SHA256SUMS");
  expect(manifestResponse.ok()).toBe(true);
  expect(await manifestResponse.text()).toContain("  index.html");

  expect(browserProblems).toEqual([]);
});

test("allows the Pera secure relay through the packaged security policy", async ({
  page,
}) => {
  const relayPolicyBlocks: string[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /^Connecting to 'wss:\/\//.test(message.text()) &&
      message.text().includes("Content Security Policy")
    ) {
      relayPolicyBlocks.push(message.text());
    }
  });

  await page.route("https://wc.perawallet.app/config.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        web_wallet: false,
        use_sound: false,
        servers: ["https://wallet-connect-a.perawallet.app"],
      }),
    })
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Wallet", exact: true }).click();

  const relaySocket = page.waitForEvent("websocket", {
    predicate: (socket) =>
      socket.url().startsWith("wss://wallet-connect-a.perawallet.app/"),
  });

  await page.getByRole("button", { name: "Connect Pera Wallet" }).click();
  expect((await relaySocket).url()).toMatch(
    /^wss:\/\/wallet-connect-a\.perawallet\.app\//
  );
  expect(relayPolicyBlocks).toEqual([]);
});
