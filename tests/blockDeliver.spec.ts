import test, { expect, Page } from "@playwright/test";
import {
  BlockListPage,
  BlockRegisterInput,
} from "../classes/pages/blockListPage";
import { BlockDetailPage } from "../classes/pages/blockDetailPage";

const blockRegiterInputs: BlockRegisterInput[] = [
  // {
  //   pclName: "水栓金具",
  //   blockName: "単体紐づけブロック2",
  //   productCd: 123182329,
  //   categories: ["オフィス家具"],
  // },
  {
    pclName: "水栓金具",
    blockName: "ai単体紐づけブロック42162826216621141315122323314543",
    productCd: 1342422216589,
    categories: ["バス/浴室部品/シャワー/シャワーヘッド"],
  },
  // {
  //   pclName: "水栓金具",
  //   blockName: "ai単体紐づけブロック4",
  //   productCd: 12318232181,
  //   categories: [
  //     "水栓金具/水栓金具/水栓金具/水栓金具",
  //     "テストカテゴリ大-3/テストカテゴリ中-1/テストカテゴリ小-1/テストカテゴリ小小-1",
  //     "工具",
  //   ],
  // },
  // {
  //   pclName: "水栓金具",
  //   blockName: "ai単体紐づけブロック5",
  //   productCd: 12318232182,
  //   categories: [
  //     "複数紐づけテスト大4/複数紐づけテスト中1/複数紐づけテスト小1",
  //     "複数紐づけテスト大7/複数紐づけテスト中1/複数紐づけテスト小1",
  //   ],
  // },
  // {
  //   pclName: "水栓金具",
  //   blockName: "単体紐づけブロック6",
  //   productCd: 12318232183,
  //   categories: [
  //     "複数紐づけテスト大4/複数紐づけテスト中1/複数紐づけテスト小1",
  //     "複数紐づけテスト大7/複数紐づけテスト中1/複数紐づけテスト小1",
  //     "複数紐づけテスト大12/複数紐づけテスト中1/複数紐づけテスト小1",
  //   ],
  // },
];

const categoryInputs: string[] = ["TOY BOXX", "水栓金具", "カテゴリ３"];

test("check if only the block with 4 level of caetegory can be delivered", async ({
  page,
}) => {
  await page.goto(
    "https://datamng2.simplepage.biz/#/media?tag=01HA1E4D238YKFZCRRJCAR6S5N"
  );

  await page.getByText("新ブロック登録", { exact: true }).click();
  const blockListPage = new BlockListPage(page);
  const blockDetailPage = new BlockDetailPage(page);

  // ブロック作成処理
  const newSeriesKeys: string[] = [];
  for (const input of blockRegiterInputs) {
    const generatedCd: string = await blockListPage.createBlock(input);
    newSeriesKeys.push(generatedCd);
  }
  if (blockRegiterInputs.length !== newSeriesKeys.length) return;

  // カテゴリ紐づけ処理
  for (let i = 0; i < blockRegiterInputs.length; i++) {
    await blockListPage.reGetLocator(page);
    await blockListPage.clickRowByCd(newSeriesKeys[i]);

    const populatedCategories = blockRegiterInputs[i].categories.map(
      (category) => {
        return category.split("/");
      }
    );
    await blockDetailPage.reGetLocator(page);
    await blockDetailPage.updateCategory(populatedCategories);

    await blockDetailPage.back();
  }

  // //カテゴリ紐づけ確認処理
  // for (let i = 0; i < blockRegiterInputs.length; i++) {
  //   console.log(`Starting verification for block ${i}`);
  //   const input = blockRegiterInputs[i];
  //   await blockListPage.reGetLocator(page);

  //   let results: boolean[] = [];
  //   for (const category of input.categories) {
  //     const row = await blockListPage.findRowByKeys(newSeriesKeys[i]);
  //     console.log(`Found row for ${category}: ${(await row.count()) > 0}`);

  //     if ((await row.count()) > 0) {
  //       const result = await blockListPage.containsCategoryName(category, row);
  //       console.log(`Category check result for ${category}: ${result}`);
  //       results.push(result);
  //     } else {
  //       results.push(false);
  //     }
  //   }

  //   const allTrue = results.every((result) => result === true);
  //   console.log(`All categories verified: ${allTrue}`);
  //   expect(allTrue).toBeTruthy();
  //   await page.waitForTimeout(1000); // Add small delay between iterations
  // }

  //ブロック削除処理
  for (const key of newSeriesKeys) {
    await blockListPage.reGetLocator(page);
    await blockListPage.checkRowFromBlockList(key);
    await blockListPage.deleteBlock();
  }
});
