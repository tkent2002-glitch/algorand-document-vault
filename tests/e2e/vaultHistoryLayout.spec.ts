import { expect, test } from "@playwright/test";

test("stacks evidence history fields when the detail panel is narrow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/");

  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("algorand-document-vault");
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("evidence-records", "readwrite");
      const store = transaction.objectStore("evidence-records");
      const createdAt = "2026-08-30T17:31:45.000Z";
      const submittedAt = "2026-08-30T17:32:15.000Z";
      const confirmedAt = "2026-08-30T17:32:51.000Z";
      const hashValue = "1e82e3303c16e2d460fc54c4a9ed0ff7ec9c741210dd7d316101daead202cd44";

      store.clear();
      store.put({
        id: "2af0c05b-71bd-4c72-b61f-49d4f89da77c",
        status: "confirmed",
        documentName: "test 7 link test.txt",
        hashAlgorithm: "SHA-256",
        hashValue,
        proof: {
          id: "vault-history-layout-proof",
          status: "created",
          payload: {
            schemaVersion: "1.0",
            hash: { algorithm: "SHA-256", value: hashValue },
            createdAt,
          },
          createdAt,
        },
        algorandTransactionId:
          "YYLAWDEDYIF3ZWW5MFX6JPUC6BBSXBJP6WDT7YTCGJQQUA36GEOA",
        submittedAt,
        confirmedRound: 66831848,
        confirmedAt,
        createdAt,
      });

      transaction.addEventListener("complete", () => resolve());
      transaction.addEventListener("abort", () => reject(transaction.error));
      transaction.addEventListener("error", () => reject(transaction.error));
    });

    database.close();
  });

  await page.reload();
  await page.getByRole("button", { name: "Vault", exact: true }).click();
  await page.locator(".evidence-index-item").first().click();

  const historyDisclosure = page
    .locator("details.vault-detail-disclosure")
    .filter({ hasText: "Evidence history" });
  await historyDisclosure.locator("summary").click();

  const historyItem = historyDisclosure.locator(".evidence-history-item");
  await expect(historyItem).toBeVisible();

  const layout = await historyItem.evaluate((element) => {
    const itemRect = element.getBoundingClientRect();
    const childRects = Array.from(element.children).map((child) =>
      child.getBoundingClientRect()
    );
    const overlaps = childRects.some((first, index) =>
      childRects.slice(index + 1).some(
        (second) =>
          first.left < second.right &&
          first.right > second.left &&
          first.top < second.bottom &&
          first.bottom > second.top
      )
    );

    return {
      childCount: childRects.length,
      childrenStayInside: childRects.every(
        (rect) =>
          rect.left >= itemRect.left - 1 &&
          rect.right <= itemRect.right + 1 &&
          rect.top >= itemRect.top - 1 &&
          rect.bottom <= itemRect.bottom + 1
      ),
      columnCount: getComputedStyle(element).gridTemplateColumns.split(" ").length,
      overlaps,
    };
  });

  expect(layout.childCount).toBe(3);
  expect(layout.columnCount).toBe(1);
  expect(layout.childrenStayInside).toBe(true);
  expect(layout.overlaps).toBe(false);
});
