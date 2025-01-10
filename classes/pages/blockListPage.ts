import { expect, Locator, Page } from "@playwright/test";

export type BlockRegisterInput = {
  productCd: number;
  pclName: string;
  blockName: string;
  categories: string[];
};
export class BlockListPage {
  private blockRegisterButton: Locator;
  private optionButton: Locator;
  private deliverButton: Locator;

  constructor(public page: Page) {
    this.blockRegisterButton = this.page.getByText("新ブロック登録");
    this.deliverButton = this.page.getByText("サイトで配信する");
    this.optionButton = this.page.getByRole("button", { name: "ellipsis" });
  }

  async reGetLocator(page: Page) {
    this.blockRegisterButton = this.page.getByText("新ブロック登録");
    this.deliverButton = this.page.getByText("サイトで配信する");
    this.optionButton = this.page.getByRole("button", { name: "ellipsis" });
  }

  ////////////////////////////////////utils////////////////////////////////////////
  async clickRowByCd(cd: string) {
    await this.gotoFirstpage();
    while (true) {
      const row = await this.findRowByKeys(cd);
      if ((await row.count()) > 0) {
        await row.click();
        break;
      }

      const result = await this.#gotoNextPage();
      if (result === "no more page") {
        await this.gotoFirstpage();
        break;
      }
    }
  }

  async gotoFirstpage() {
    this.page.locator(`li[title="1"]`).click();
  }
  async checkRowFromBlockList(blockCd: string) {
    console.log(`Starting to check row with blockCd: ${blockCd}`);
    while (true) {
      const row = await this.findRowByKeys(blockCd);
      const rowCount = await row.count();
      console.log(`Found ${rowCount} rows for blockCd: ${blockCd}`);

      if (rowCount > 0) {
        await row.getByLabel("", { exact: true }).check();
        console.log(`Checked row for blockCd: ${blockCd}`);
      }

      const result = await this.#gotoNextPage();
      console.log(`Goto next page result: ${result}`);

      if (result === "no more page") {
        await this.gotoFirstpage();
        console.log(`No more pages. Returning to first page.`);
        break;
      }
    }
  }

  async findRowByKeys(key: string): Promise<Locator> {
    await this.gotoFirstpage();
    const row = this.page.locator(`[data-row-key*="${key}"]`);
    await row.waitFor();
    return row;
  }

  async #gotoNextPage() {
    const nextButton = this.page.getByRole("button", { name: "right" });
    const isNextDisable = await nextButton.evaluate((button) =>
      button.hasAttribute("disabled")
    );
    if (isNextDisable) {
      return "no more page";
    } else {
      await nextButton.click();
    }
  }

  ////////////////////////////////////read////////////////////////////////////////
  async containsCategoryName(categoryName: string, row: Locator) {
    await row.waitFor();
    const modalButton = row.getByRole("button");
    if ((await modalButton.count()) > 0) {
      await modalButton.click();
      const modal = this.page.getByRole("dialog");
      await modal.waitFor({ state: "visible" });
      const isCategoryName = await modal
        .locator(`text=${categoryName}`)
        .count();
      return !!isCategoryName;
    }
    const isCategoryName = await row.locator(`text=${categoryName}`).count();
    return !!isCategoryName;
  }

  ////////////////////////////////////update////////////////////////////////////////
  // async deliverBlock(blockCdList: string[]) {
  //   await this.checkRowFromBlockList(blockCdList);
  //   await this.deliverButton.click();
  //   await this.page.getByText("サイトへ配信する").click();
  //   //成功メッセージを受け取る処理を記述する

  //   expect(this.page.getByText("ブロックが正常に配信されました")).toBeVisible();
  // }

  ////////////////////////////////////create////////////////////////////////////////
  async createBlock({ blockName, pclName, productCd }: BlockRegisterInput) {
    try {
      // Click the register button
      await this.blockRegisterButton.click();

      // Wait for modal to appear
      const modal = this.page.getByRole("dialog");
      await modal.waitFor({ state: "visible" });
      const responsePromise = this.page.waitForResponse(
        (response) =>
          response.url().includes("series/register") &&
          response.status() === 200
      );
      // Fill the block name
      const textbox = modal.getByRole("textbox");
      await textbox.waitFor(); // Ensure textbox is available
      await textbox.fill(blockName);

      // Select pclName from dropdown
      const dropdown = modal.locator(".ant-select-selector");
      await dropdown.waitFor({ timeout: 5000 });
      await dropdown.click();
      const pclOption = this.page.getByText(pclName, { exact: true });
      await pclOption.waitFor({ timeout: 5000 }); // Increase timeout to 5 seconds
      await pclOption.click();

      // Handle required inputs
      const requiredInputs = modal
        .locator('text="*"')
        .locator("..")
        .locator("~ input");
      await requiredInputs.waitFor(); // Ensure required input is available
      console.log(
        "Required input element:",
        await requiredInputs.evaluate((node) => node.outerHTML)
      );
      await requiredInputs.click();
      await requiredInputs.fill(productCd.toString());

      // Ensure modal is still visible before clicking save button
      await modal.waitFor({ state: "visible" });
      console.log("Modal is still visible");

      // Click the save button
      const saveButton = this.page.getByRole("button", { name: "保 存" });
      console.log(
        "Save button element:",
        await saveButton.evaluate((node) => node.outerHTML)
      );
      await saveButton.click();

      // Verify success message
      const successMessage =
        this.page.getByText("ブロックが正常に保存されました");
      await expect(successMessage).toBeVisible();
      const response = await responsePromise;
      const responseBody = await response.json();
      await successMessage.waitFor({ state: "hidden" });
      return responseBody.result === "success" ? responseBody.series_code : "";
    } catch (error) {
      console.error("Error in createBlock method:", error);
      throw error; // Re-throw the error after logging it
    }
  }

  ////////////////////////////////////delete////////////////////////////////////////
  async deleteBlock() {
    await this.optionButton.click();
    await this.page.getByText("ブロックを削除").click();
    const modal = this.page.getByRole("dialog");
    await modal.waitFor({ state: "visible" });
    await modal.getByText("削 除", { exact: true }).click();

    expect(this.page.getByText("ブロックが完全に削除されました")).toBeVisible();
  }
}
