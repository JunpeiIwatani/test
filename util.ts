import { Locator, Page } from "@playwright/test";

export async function tryClick(
  locator: Locator,
  postClickExpectation?: () => Promise<void>,
  retries = 3,
  delay = 3000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Locatorオブジェクトでクリック
      await locator.click();
      console.log(`クリック成功: ${locator}`);

      // Post-click expectation
      if (postClickExpectation) {
        await postClickExpectation();
      }

      return; // 成功したら終了
    } catch (e) {
      console.log(`クリック失敗 (試行 ${attempt}/${retries}): ${e.message}`);
      if (attempt < retries) {
        console.log(`再試行中... (${delay}ms 待機)`);
        await locator.page().waitForTimeout(delay); // 再試行前に待機
      } else {
        console.log("全ての試行が失敗しました");
        throw e; // 最後の試行で失敗した場合は例外をスロー
      }
    }
  }
}

export async function waitForClass(
  locator: Locator,
  className: RegExp,
  timeout = 10000
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const classList = await locator.evaluate((node) => node.className);
    if (className.test(classList)) {
      return;
    }
    await locator.page().waitForTimeout(100); // Wait for a short interval before retrying
  }
  throw new Error(
    `Timeout of ${timeout}ms exceeded while waiting for class ${className}`
  );
}
