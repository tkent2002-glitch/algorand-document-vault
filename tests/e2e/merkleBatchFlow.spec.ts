import { expect, test } from "@playwright/test";

test("prepares a deterministic Merkle batch and stores its members", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Notarize" }).click();
  await page.getByRole("button", { name: "Document batch" }).click();

  await expect(
    page.getByText("On Windows, hold Ctrl to choose individual files")
  ).toBeVisible();

  await page
    .getByLabel("Documents to notarize as one Merkle batch")
    .setInputFiles([
      { name: "contract-a.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "contract-b.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
    ]);

  await expect(page.getByText("2 documents selected")).toBeVisible();
  await expect(page.getByText("Batch prepared. Review the root and approve one TestNet transaction.")).toBeVisible();
  await expect(page.getByText("On-chain transactions")).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Vault" }).click();
  await expect(page.getByRole("heading", { name: "Batch anchors" })).toBeVisible();
  await expect(
    page.getByText("View documents and create verification links")
  ).toBeVisible();
  await page.getByText("2 documents", { exact: true }).click();
  await expect(page.getByText("contract-a.txt")).toBeVisible();
  await expect(page.getByText("contract-b.txt")).toBeVisible();
});

test("keeps the batch workflow usable at a 320 CSS-pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Notarize" }).click();

  const batchMode = page.getByRole("button", { name: "Document batch" });
  await expect(batchMode).toHaveAttribute("aria-pressed", "false");
  await batchMode.click();
  await expect(batchMode).toHaveAttribute("aria-pressed", "true");

  await page
    .getByLabel("Documents to notarize as one Merkle batch")
    .setInputFiles([
      { name: "mobile-a.txt", mimeType: "text/plain", buffer: Buffer.from("alpha") },
      { name: "mobile-b.txt", mimeType: "text/plain", buffer: Buffer.from("beta") },
      { name: "mobile-c.txt", mimeType: "text/plain", buffer: Buffer.from("gamma") },
    ]);
  await expect(page.getByText("3 documents selected")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
    )
    .toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Vault" }).click();
  const batchSummary = page.locator("details.batch-vault-group > summary");
  await batchSummary.focus();
  await expect(batchSummary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("mobile-a.txt")).toBeVisible();
  await expect(page.getByText("mobile-c.txt")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
    )
    .toBeLessThanOrEqual(1);
});
