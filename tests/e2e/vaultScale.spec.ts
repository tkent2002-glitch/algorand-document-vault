import { expect, test } from "@playwright/test";

test("keeps a 10,000-document Vault bounded and navigable", async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== "chromium", "Large-dataset UI coverage runs once in Chromium.");

  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Cryptographic document integrity, anchored on Algorand.",
    })
  ).toBeVisible();

  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("algorand-document-vault");
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("evidence-records", "readwrite");
      const store = transaction.objectStore("evidence-records");
      store.clear();

      for (let index = 0; index < 10_000; index += 1) {
        const hashValue = index.toString(16).padStart(64, "0");
        const createdAt = new Date(
          Date.UTC(2026, 0, 1, 0, 0, index)
        ).toISOString();

        store.put({
          id: `scale-record-${index}`,
          status: index % 5 === 0 ? "confirmed" : "draft",
          documentName: `scale-document-${index.toString().padStart(5, "0")}.pdf`,
          hashAlgorithm: "SHA-256",
          hashValue,
          proof: {
            id: `scale-proof-${index}`,
            status: "created",
            payload: {
              schemaVersion: "1.0",
              hash: { algorithm: "SHA-256", value: hashValue },
              createdAt,
            },
            createdAt,
          },
          confirmedRound: index % 5 === 0 ? index : undefined,
          createdAt,
        });
      }

      transaction.addEventListener("complete", () => resolve());
      transaction.addEventListener("abort", () => reject(transaction.error));
      transaction.addEventListener("error", () => reject(transaction.error));
    });

    database.close();
  });

  await page.reload();
  await page.getByRole("button", { name: "Vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Evidence Vault", exact: true })
  ).toBeVisible();

  await expect(page.getByText("Showing 1–50 of 10,000 documents")).toBeVisible();
  await expect(page.locator(".evidence-index-item")).toHaveCount(50);

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Showing 51–100 of 10,000 documents")).toBeVisible();
  await expect(page.locator(".evidence-index-item")).toHaveCount(50);

  await page.getByRole("searchbox", {
    name: "Search evidence by filename or fingerprint",
  }).fill("scale-document-09999");
  await expect(page.getByText("Showing 1–1 of 1 documents")).toBeVisible();
  await expect(page.locator(".evidence-index-item")).toHaveCount(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".evidence-index-item").click();
  await expect(
    page.getByRole("button", { name: "Back to document list" })
  ).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Document fingerprints" })
  ).toBeHidden();

  await page.getByRole("button", { name: "Back to document list" }).click();
  await expect(
    page.getByRole("complementary", { name: "Document fingerprints" })
  ).toBeVisible();
});
