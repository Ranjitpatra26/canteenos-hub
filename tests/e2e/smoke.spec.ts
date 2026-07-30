import { test, expect, type ConsoleMessage, type Page } from "@playwright/test";

/**
 * Smoke suite: every key surface must render, guard correctly and stay free of
 * console errors. Kept intentionally shallow — deep feature behaviour belongs
 * in dedicated specs.
 */

/** Noise we never want to fail a smoke run on. */
const IGNORED_CONSOLE = [
  /THREE\./i, // three.js deprecation notices
  /Download the React DevTools/i,
  /favicon/i,
  /ResizeObserver loop/i,
  /the server responded with a status of 404/i, // expected on the not-found route
];

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORED_CONSOLE.some((r) => r.test(text))) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

/** Public routes render for anonymous visitors. */
const PUBLIC_ROUTES = [
  { path: "/", heading: /canteen/i },
  { path: "/login", heading: /sign in|welcome/i },
  { path: "/register", heading: /create|register|account/i },
  { path: "/forgot-password", heading: /password/i },
];

/** Routes behind the auth gate — anonymous visitors must land on /login. */
const GUARDED_ROUTES = [
  "/app",
  "/app/menu",
  "/app/cart",
  "/app/orders",
  "/kitchen",
  "/admin",
  "/admin/menu",
  "/admin/workforce",
  "/admin/approvals",
  "/admin/organization",
  "/admin/monitoring",
];

test.describe("public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads without console errors`, async ({ page }) => {
      const errors = collectConsoleErrors(page);

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);

      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page).toHaveTitle(/CanteenOS/i);
      await page.waitForTimeout(1200); // let deferred/lazy chunks settle

      expect(errors, `console errors on ${route.path}`).toEqual([]);
    });
  }

  test("landing page shows product imagery", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const images = page.locator("main img");
    await expect(images.first()).toBeVisible();

    // Every rendered image must actually decode (no broken sources).
    const broken = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    );
    expect(broken, "broken images").toEqual([]);
  });

  test("unknown route renders the 404 screen", async ({ page }) => {
    await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("no horizontal overflow on the landing page", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe("route guards", () => {
  for (const path of GUARDED_ROUTES) {
    test(`${path} redirects anonymous visitors to sign in`, async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/login/, { timeout: 15_000 });

      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading").first()).toBeVisible();
      expect(errors, `console errors while guarding ${path}`).toEqual([]);
    });
  }
});

test.describe("auth flow navigation", () => {
  test("login page links to register and password recovery", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await page.getByRole("link", { name: /forgot/i }).first().click();
    await expect(page).toHaveURL(/forgot-password/);

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /create|sign up|register/i }).first().click();
    await expect(page).toHaveURL(/register/);
  });

  test("empty sign in submission does not navigate away", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/login/);
  });
});
