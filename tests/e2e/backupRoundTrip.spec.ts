import { expect, test, type Browser, type Page } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:4180";
const BACKUP_PASSWORD = "ADv-clean-profile-test-2026!";

async function openVault(page: Page) {
  await page.getByRole("button", { name: "Vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Evidence Vault" })
  ).toBeVisible();
}

async function expectOnePersistedRecord(page: Page) {
  const totalRecords = page
    .locator(".vault-stats > div")
    .filter({ hasText: "Total Records" })
    .locator("strong");

  await expect(totalRecords).toHaveText("1");
  await expect(
    page.getByRole("button", {
      name: /backup-round-trip\.txt Status: draft/,
    })
  ).toBeVisible();

  await page.reload();
  await openVault(page);
  await expect(totalRecords).toHaveText("1");
}

async function restoreBackup(
  browser: Browser,
  backupPath: string,
  password?: string
) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL);
    await openVault(page);
    await page
      .getByLabel("Evidence Vault backup file")
      .setInputFiles(backupPath);

    if (password) {
      await expect(
        page.getByText("Encrypted Backup Selected")
      ).toBeVisible();
      await page
        .getByLabel("Backup Password")
        .last()
        .fill("incorrect-backup-password");
      await page
        .getByRole("button", { name: "Decrypt and Preview" })
        .click();
      await expect(page.getByRole("alert")).toHaveText(
        "Backup decryption failed. The password may be incorrect or the file may be corrupted."
      );
      await page.getByLabel("Backup Password").last().fill(password);
      await page
        .getByRole("button", { name: "Decrypt and Preview" })
        .click();
    }

    await expect(
      page.getByText("Backup Validation Passed")
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Import New Records" })
      .click();
    await expect(
      page.getByText("Imported", { exact: true })
    ).toBeVisible();
    await expectOnePersistedRecord(page);
  } finally {
    await context.close();
  }
}

test("round-trips plain and encrypted backups through clean profiles", async ({
  browser,
  page,
}) => {
  await page.goto(BASE_URL);
  await page
    .getByRole("button", { name: "Notarize", exact: true })
    .click();
  await page.getByLabel("Document to notarize").setInputFiles({
    name: "backup-round-trip.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Evidence Vault clean-profile backup validation."),
  });
  await expect(
    page.getByText("backup-round-trip.txt", { exact: true })
  ).toBeVisible();

  await openVault(page);

  const plainDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export Plain Backup" })
    .click();
  const plainDownload = await plainDownloadPromise;
  const plainBackupPath = await plainDownload.path();
  expect(plainBackupPath).not.toBeNull();

  await page.getByLabel("Backup Password").first().fill(BACKUP_PASSWORD);
  await page
    .getByLabel("Confirm Password")
    .fill(BACKUP_PASSWORD);

  const encryptedDownloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export Encrypted Backup" })
    .click();
  const encryptedDownload = await encryptedDownloadPromise;
  const encryptedBackupPath = await encryptedDownload.path();
  expect(encryptedBackupPath).not.toBeNull();

  await restoreBackup(browser, plainBackupPath!, undefined);
  await restoreBackup(
    browser,
    encryptedBackupPath!,
    BACKUP_PASSWORD
  );
});
