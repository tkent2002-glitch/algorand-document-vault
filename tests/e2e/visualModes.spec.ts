import { expect, test, type Page } from "@playwright/test";

const PAGE_NAMES = [
  "Dashboard",
  "Notarize",
  "Verify",
  "Vault",
  "Wallet",
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    )
    .toBe(true);
}

test("renders every page in dark mode without overflow", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(() =>
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
    )
    .toBe(true);

  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--bg")
          .trim()
      )
    )
    .toBe("#050b18");

  for (const pageName of PAGE_NAMES) {
    await page
      .getByRole("button", { name: pageName, exact: true })
      .click();
    await expectNoHorizontalOverflow(page);
  }
});

test("disables meaningful motion when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(() =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    )
    .toBe(true);

  const motionOffenders = await page.locator("*").evaluateAll((elements) => {
    function exceedsReducedMotionLimit(value: string) {
      return value.split(",").some((duration) => {
        const normalized = duration.trim();
        const milliseconds = normalized.endsWith("ms")
          ? Number.parseFloat(normalized)
          : Number.parseFloat(normalized) * 1000;

        return milliseconds > 0.01;
      });
    }

    return elements
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          animationDuration: style.animationDuration,
          tag: element.tagName,
          transitionDuration: style.transitionDuration,
        };
      })
      .filter(
        ({ animationDuration, transitionDuration }) =>
          exceedsReducedMotionLimit(animationDuration) ||
          exceedsReducedMotionLimit(transitionDuration)
      );
  });

  expect(motionOffenders).toEqual([]);
});

test("retains visible keyboard focus in forced-colors mode", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "Playwright forced-colors emulation is Chromium-only."
  );

  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");

  await expect
    .poll(() =>
      page.evaluate(() =>
        window.matchMedia("(forced-colors: active)").matches
      )
    )
    .toBe(true);

  const dashboardButton = page.getByRole("button", {
    name: "Dashboard",
    exact: true,
  });
  await dashboardButton.focus();

  const focusStyle = await dashboardButton.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(1);
  await expectNoHorizontalOverflow(page);
});

test("reflows every page at a 320 CSS-pixel viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");

  for (const pageName of PAGE_NAMES) {
    await page
      .getByRole("button", { name: pageName, exact: true })
      .click();
    await expectNoHorizontalOverflow(page);

    const undersizedControls = await page
      .locator("button:visible, input:visible, select:visible")
      .evaluateAll((elements) =>
        elements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              height: rect.height,
              label:
                element.getAttribute("aria-label") ??
                element.textContent?.trim() ??
                element.tagName,
              width: rect.width,
            };
          })
          .filter(
            ({ height, width }) =>
              height > 0 && width > 0 && (height < 44 || width < 44)
          )
      );

    expect(undersizedControls).toEqual([]);
  }
});
