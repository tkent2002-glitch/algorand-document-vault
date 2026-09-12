import { expect, test } from "@playwright/test";

test("prepares a deterministic Merkle batch and stores its members", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Notarize" }).click();
  await page.getByRole("button", { name: "Document batch" }).click();

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
  await page.getByText("2 documents", { exact: true }).click();
  await expect(page.getByText("contract-a.txt")).toBeVisible();
  await expect(page.getByText("contract-b.txt")).toBeVisible();
});
