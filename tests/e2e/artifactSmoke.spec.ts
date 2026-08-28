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
  expect(response?.headers()["content-security-policy"]).toContain(
    "default-src 'self'"
  );
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
