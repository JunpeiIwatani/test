import { test as setup, expect, Page } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("https://datamng2.simplepage.biz/#/login");
  await page.locator("#loginForm_email").click();
  await page.locator("#loginForm_email").fill("v4qbu85z@profield.jp");
  await page.locator("#loginForm_password").click();
  await page.locator("#loginForm_password").fill("profield01");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(
    "https://datamng2.simplepage.biz/#/media?tag=01HA1E4D238YKFZCRRJCAR6S5N"
  );
  await page.context().storageState({ path: authFile });
});
