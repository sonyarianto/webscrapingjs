import { chromium } from "playwright";
import { excludedResourceTypes } from "../../../config";
import {
  browserSelector,
  processExcludedResourceTypes,
  verboseBrowserUsed,
  getAttributeFromLocatorSelector,
} from "../../../utils";
import type { News, ScrapeArgument } from "../../../types";

const baseUrlPath = "https://indeks.kompas.com/";
const listPageItemsSelector =
  'xpath=//div[contains(@class, "latest--indeks")]/div[contains(@class, "article__list")]';
const listPageTitleSelector = "h3.article__title";
const listPageLinkSelector = "a[href]";
const listPageImageSelector = ".article__list__asset img[src]";

const detailImageUrlSelector = 'meta[property="og:image"]';
const detailLocalCategorySelector = 'meta[name="content_category"]';
const detailLocalSubCategorySelector = 'meta[name="content_subcategory"]';
const detailLocalTagsSelector = 'meta[name="content_tags"]';
const detailAuthorsSelector = 'meta[name="author"]';
const detailShortDescriptionSelector = 'meta[property="og:description"]';
const detailPublishedDateTimeSelector =
  'meta[property="article:published_time"]';

const timeZoneId = "Asia/Jakarta";
const listPageExcludedResourceTypes = [...excludedResourceTypes];
const detailExcludedResourceTypes = [...excludedResourceTypes];

let _countListPageItems = 0;

listPageExcludedResourceTypes.splice(
  listPageExcludedResourceTypes.indexOf("image"),
  1,
);

detailExcludedResourceTypes.splice(
  detailExcludedResourceTypes.indexOf("image"),
  1,
);

export const scrape = async (scrape_argument: ScrapeArgument = {}) => {
  try {
    verboseBrowserUsed(scrape_argument);

    const browser = await browserSelector(chromium, scrape_argument);
    const context = await browser.newContext({
      timezoneId: timeZoneId,
    });

    let allItems: News[] = [];

    let pageIndexes = Array.from(
      { length: scrape_argument.endPageIndex ?? 1 },
      (_, i) => i + (scrape_argument.startPageIndex ?? 1),
    );

    if (scrape_argument.testListCount ?? false) {
      pageIndexes = [1];
    }

    if (scrape_argument.testDetailData ?? false) {
      pageIndexes = [1];
    }

    await Promise.allSettled(
      pageIndexes.map(async (pageIndex) => {
        const listPage = await context.newPage();

        const listPageUrl = `${baseUrlPath}?page=${pageIndex}`;

        await processExcludedResourceTypes(
          listPage,
          listPageExcludedResourceTypes,
        );

        await listPage.goto(listPageUrl);

        let listPageItemsLocator = listPage.locator(listPageItemsSelector);

        const countListPageItems = await listPageItemsLocator.count();

        if (scrape_argument.verbose ?? false) {
          console.log(
            `P#${pageIndex} C#${countListPageItems} U#${listPageUrl}`,
          );
        }

        if (scrape_argument.testListCount ?? false) {
          await listPage.close();
          await context.close();
          await browser.close();

          _countListPageItems = countListPageItems;

          return;
        }

        if (scrape_argument.testDetailData ?? false) {
          listPageItemsLocator = listPageItemsLocator.first();
        }

        const resultListPageItems = await listPageItemsLocator.evaluateAll(
          (el, args) =>
            el.map((el) => {
              const item: News = {
                _internal_page: args.pageIndex,
              };

              let listTitle =
                el
                  .querySelector(args.listPageTitleSelector)
                  ?.textContent?.trim() ?? null;

              let listLink =
                (
                  el.querySelector(
                    args.listPageLinkSelector,
                  ) as HTMLAnchorElement
                )?.href.trim() ?? null;

              let listImageUrl =
                (
                  el.querySelector(
                    args.listPageImageSelector,
                  ) as HTMLImageElement
                )?.src.trim() ?? null;

              return {
                ...item,
                title: listTitle,
                link: listLink,
                image_url_on_list: listImageUrl,
              };
            }),
          {
            listPageTitleSelector: listPageTitleSelector,
            listPageLinkSelector: listPageLinkSelector,
            listPageImageSelector: listPageImageSelector,
            pageIndex: pageIndex,
          },
        );

        listPage.close();

        await Promise.allSettled(
          resultListPageItems.map(async (result, index) => {
            if (!result.link) return;
            if (!result.title) return;

            result.image_url_on_list_2 =
              result.image_url_on_list?.split("?")[0];

            const detailPage = await context.newPage();

            processExcludedResourceTypes(
              detailPage,
              detailExcludedResourceTypes,
            );

            await detailPage.goto(result.link);

            if (scrape_argument.verbose ?? false) {
              console.log(`P#${pageIndex} I#${index} ${result.title}`);
            }

            const detailPageLocator = detailPage.locator("html");

            // Get image_url_on_detail

            let detailImageUrl = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailImageUrlSelector,
              "content",
            );
            result.image_url_on_detail = detailImageUrl;

            // Get image_url_on_detail_2, without query string

            const detailImageUrlWithoutQueryString =
              detailImageUrl?.split("?")[0];
            result.image_url_on_detail_2 = detailImageUrlWithoutQueryString;

            // Get local_category

            let detailLocalCategory = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailLocalCategorySelector,
              "content",
            );
            result.local_category = detailLocalCategory ?? null;

            // Get local sub category

            let localSubCategory = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailLocalSubCategorySelector,
              "content",
            );
            result.local_sub_category = localSubCategory?.trim() ?? null;

            // Get local tags

            let localTags = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailLocalTagsSelector,
              "content",
            );
            result.local_tags =
              localTags?.split(",").map((tag) => tag.trim()) ?? null;

            // Get authors

            let authors = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailAuthorsSelector,
              "content",
            );
            result.authors = authors?.split(",") ?? null;

            // Get short_description

            let detailShortDescription =
              (
                await detailPageLocator.evaluate((el, args) => {
                  const description = el.querySelector(args) as HTMLMetaElement;
                  return description?.content?.trim() ?? null;
                }, detailShortDescriptionSelector)
              )?.trim() ?? null;
            result.short_description = detailShortDescription;

            // Get published_datetime

            let publishedDateTime = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailPublishedDateTimeSelector,
              "content",
            );
            result.published_datetime = publishedDateTime;

            const publishedDateTimeUtc = new Date(
              publishedDateTime as string,
            ).toISOString();
            result.published_datetime_utc = publishedDateTimeUtc;

            result.internal_index = index;

            await detailPage.close();

            allItems.push(result);
          }),
        );
      }),
    );

    await context.close();
    await browser.close();

    if (scrape_argument.testListCount ?? false) {
      return _countListPageItems;
    }

    return allItems;
  } catch (error) {
    throw error;
  }
};
