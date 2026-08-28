import { expect, test } from "@playwright/test";

test("loads deferred features without browser errors", async ({ page }) => {
  const browserProblems: string[] = [];
  const requestedAssets: string[] = [];

  await page.route("https://fonts.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/css",
      body: "",
    })
  );
  await page.route(
    "https://wc.perawallet.app/config.json",
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      })
  );

  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      browserProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    browserProblems.push(`pageerror: ${error.message}`);
  });
  page.on("request", (request) => {
    requestedAssets.push(request.url());
  });

  await page.goto("/");

  await expect(page).toHaveTitle(
    "Dashboard | Algorand Document Vault"
  );
  await expect(
    page.getByRole("heading", {
      name: "Cryptographic document integrity, anchored on Algorand.",
    })
  ).toBeVisible();
  expect(
    requestedAssets.some((url) =>
      /\/(algorand|pera-wallet)-[^/]+\.js$/.test(url)
    )
  ).toBe(false);

  await page.getByRole("button", { name: "Notarize" }).click();
  await expect(page).toHaveTitle(
    "Notarize | Algorand Document Vault"
  );
  await expect(
    page.getByRole("heading", { name: "Notarize Document" })
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          typeof (
            window as Window & { Buffer?: unknown }
          ).Buffer
      )
    )
    .toBe("function");

  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page).toHaveTitle(
    "Verify | Algorand Document Vault"
  );
  await expect(
    page.getByLabel("Document to verify")
  ).toBeVisible();

  await page.getByRole("button", { name: "Vault" }).click();
  await expect(page).toHaveTitle(
    "Evidence Vault | Algorand Document Vault"
  );
  await expect(
    page.getByRole("heading", { name: "Evidence Vault" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Wallet" }).click();
  await expect(page).toHaveTitle(
    "Wallet | Algorand Document Vault"
  );
  await expect(
    page.getByRole("heading", { name: "Pera Wallet" })
  ).toBeVisible();

  expect(browserProblems).toEqual([]);
});
