import { expect, Locator, Page } from "@playwright/test";
import { tryClick, waitForClass } from "../../util";

export class BlockDetailPage {
  private backButton: Locator;
  private saveButton: Locator;
  private categoryButton: Locator;

  constructor(public page: Page) {
    this.backButton = this.page
      .locator("div")
      .filter({ hasText: /^ブロック詳細カテゴリ選択保 存$/ })
      .getByRole("button")
      .first();

    this.saveButton = this.page.getByText("保存", { exact: true });
    this.categoryButton = this.page.getByText("カテゴリ選択");
  }

  async reGetLocator(page: Page) {
    this.backButton = this.page
      .locator("div")
      .filter({ hasText: /^ブロック詳細カテゴリ選択保 存$/ })
      .getByRole("button")
      .first();
    this.saveButton = this.page.getByText("保存", { exact: true });
    this.categoryButton = this.page.getByText("カテゴリ選択");
  }

  async back() {
    await this.backButton.click();
  }

  ////////////////////////////////////update////////////////////////////////////////
  async updateCategory(targetCategories: string[][]) {
    await this.categoryButton.waitFor({ state: "visible" });
    await this.categoryButton.click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor();

    for (const categories of targetCategories) {
      let locatorArray: any[] = categories.map(() => null);

      for (let nodeIndex = 0; nodeIndex < categories.length; nodeIndex++) {
        const node = categories[nodeIndex];
        let treeNode: Locator;

        if (nodeIndex === 0) {
          treeNode = modal
            .locator(".ant-tree-treenode")
            .filter({ hasText: node })
            .first();
        } else {
          const parentNode = locatorArray[nodeIndex - 1];
          console.log(`parent node: ${parentNode}`);
          if (!parentNode) {
            throw new Error(`Parent node not found for index ${nodeIndex - 1}`);
          }
          treeNode = parentNode
            .locator(
              'xpath=following-sibling::div[contains(@class, "ant-tree-treenode") and .//*[contains(text(), "' +
                node +
                '")]]'
            )
            .first();
          console.log(treeNode, "treeNode before before");
        }

        if ((await treeNode.count()) > 0) {
          console.log(treeNode, "treenode");
          locatorArray[nodeIndex] = treeNode;
          console.log(locatorArray, "after locator array");
        }

        if (nodeIndex === categories.length - 1) {
          // 最後のカテゴリの処理
          if ((await locatorArray[nodeIndex].count()) > 0) {
            const nodeBar = locatorArray[nodeIndex].locator(
              ".ant-tree-node-content-wrapper"
            );
            await nodeBar.waitFor({ state: "visible" });
            await nodeBar.click();
            await expect(nodeBar.getByText("選択済み")).toBeVisible();
          }
        } else {
          if ((await locatorArray[nodeIndex].count()) > 0) {
            const arrow = locatorArray[nodeIndex].locator(".ant-tree-switcher");
            await arrow.waitFor({ state: "visible" });
            console.log(
              "Clicking arrow:",
              await arrow.evaluate((node) => node.outerHTML)
            );
            await tryClick(
              arrow,
              async () => await waitForClass(arrow, /ant-tree-switcher_open/)
            );

            await expect(arrow).toHaveClass(/ant-tree-switcher_open/);
          }
        }
      }
    }
    const saveButton = this.page
      .getByLabel("カテゴリー選択")
      .getByRole("button", { name: "保 存" });
    await saveButton.click();
    const successMessage = this.page.getByText("カテゴリを更新しました。");
    await expect(successMessage).toBeVisible();
    console.log(
      "success messages",
      await successMessage.evaluate((node) => node.outerHTML)
    );
    await successMessage.waitFor({ state: "hidden" });

    //check
    const categoryArea = this.page
      .locator("div")
      .filter({ hasText: /^サイトカテゴリ$/ })
      .locator("xpath=following-sibling::div[1]");
    console.log(categoryArea);
    await categoryArea.waitFor({ state: "visible" });
    console.log(categoryArea);
    for (const category of targetCategories) {
      const categoryText = category.join(" > ");
      console.log(categoryText, "joined text");
      const categoryLocator = categoryArea.locator("text=" + categoryText);
      await expect(categoryLocator).toBeVisible();
    }
  }
}
