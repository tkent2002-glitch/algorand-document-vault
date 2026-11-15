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
  expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
  expect(contentSecurityPolicy).toContain("wss://*.perawallet.app");
  expect(contentSecurityPolicy).toContain("wss://*.bridge.walletconnect.org");
  const scriptPolicy = contentSecurityPolicy
    ?.split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith("script-src "));
  expect(scriptPolicy).toBe("script-src 'self'");
  expect(contentSecurityPolicy).not.toContain("'unsafe-eval'");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  expect(response?.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin"
  );

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

test("loads Pera font styles under the packaged security policy", async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/css",
      body: ":root { --pera-font-stylesheet-loaded: yes; }",
    })
  );
  await page.addInitScript(() => {
    const violations: string[] = [];
    Object.assign(window, { cspViolations: violations });
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.effectiveDirective}: ${event.blockedURI}`);
    });
  });

  const response = await page.goto("/");
  const directives = response?.headers()["content-security-policy"]
    .split(";").map((value) => value.trim());
  expect(directives).toContain("script-src 'self'");


  await page.getByRole("button", { name: "Wallet", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Pera Wallet" })).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue("--pera-font-stylesheet-loaded").trim()
  )).toBe("yes");
  expect(directives).toContain("font-src 'self' data: https://fonts.gstatic.com");
  expect(await page.evaluate(() =>
    (window as Window & { cspViolations: string[] }).cspViolations
  )).toEqual([]);
});