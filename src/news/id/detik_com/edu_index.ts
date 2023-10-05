import { chromium } from "playwright";
import { excludedResourceTypes } from "../../../config";
import {
  browserSelector,
  processExcludedResourceTypes,
  verboseBrowserUsed,
  getAttributeFromLocatorSelector,
  getTextContentFromLocatorSelector,
  getArrayFromLocatorSelector,
  getArraySplitFromAttributeFromLocatorSelector,
  getPublishedDatetimeVariant1,
  getPublishedDatetimeVariant2,
} from "../../../utils";
import type { News, ScrapeArgument } from "../../../types";

const baseUrlPath = "https://www.detik.com/edu/indeks/";
const queryStringStart = ""; // e.g. "?page="

const listPageItemsSelector = 'xpath=//div[@id="indeks-container"]//article';
const listPageTitleSelector = "h3.media__title";
const listPageLinkSelector = "a[href]";
const listPageImageSelector = ".media__image img[src]";

const detailImageUrlSelector = 'meta[property="og:image"]';
const detailLocalCategorySelector = "div.page__breadcrumb > a:last-child";
const detailLocalSubCategorySelector = null;
const detailLocalTagsSelector = "div.detail__body-tag > div.nav > a.nav__item";
const detailAuthorsSelector = 'meta[name="author"]';
const detailShortDescriptionSelector = 'meta[property="og:description"]';
const detailPublishedDateTimeSelector = null;

const timeZoneId = "Asia/Jakarta";
const listPageExcludedResourceTypes = [...excludedResourceTypes];
const detailExcludedResourceTypes = [...excludedResourceTypes];

export const scrape = async (scrape_argument: ScrapeArgument = {}) => {
  try {
    verboseBrowserUsed(scrape_argument);

    const browser = await browserSelector(chromium, scrape_argument);
    const context = await browser.newContext({
      timezoneId: timeZoneId,
    });

    let allItems: News[] = [];

    // Start scraping of the list page

    let pageIndexes = Array.from(
      { length: scrape_argument.endPageIndex ?? 1 },
      (_, i) => i + (scrape_argument.startPageIndex ?? 1),
    );

    await Promise.allSettled(
      pageIndexes.map(async (pageIndex) => {
        const listPage = await context.newPage();

        const listPageUrl = `${baseUrlPath}${queryStringStart}${pageIndex}`;

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

        // Start scraping of the detail page

        await Promise.allSettled(
          resultListPageItems.map(async (result, index) => {
            if (!result.link) return;
            if (!result.title) return;

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

            const listImageUrlWithoutQueryString =
              result.image_url_on_list?.split("?")[0] ?? null;

            // Get detailImageUrl

            let detailImageUrl = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailImageUrlSelector,
              "content",
            );

            // Get detailImageUrlWithoutQueryString, without query string

            const detailImageUrlWithoutQueryString =
              detailImageUrl?.split("?")[0];

            // Get detailLocalCategory

            let detailLocalCategory = await getTextContentFromLocatorSelector(
              detailPageLocator,
              detailLocalCategorySelector,
            );

            // If detailLocalCategory === null then try this

            if (detailLocalCategory === null) {
              detailLocalCategory = await getTextContentFromLocatorSelector(
                detailPageLocator,
                "h3.detail__subtitle",
              );
            }

            // Get detailLocalTags

            let detailLocalTags = (await getArrayFromLocatorSelector(
              detailPageLocator,
              detailLocalTagsSelector,
            )) as string[] | null;

            // Get detailAuthors

            let detailAuthors =
              (await getArraySplitFromAttributeFromLocatorSelector(
                detailPageLocator,
                detailAuthorsSelector,
                "content",
                ",",
              )) as string[] | null;

            // Get detailShortDescription

            let detailShortDescription = await getAttributeFromLocatorSelector(
              detailPageLocator,
              detailShortDescriptionSelector,
              "content",
            );

            // Get published_datetime

            let publishedDateTime =
              await getPublishedDatetimeVariant1(detailPageLocator);

            // If publishedDateTime === null then try this

            if (publishedDateTime === null) {
              publishedDateTime =
                await getPublishedDatetimeVariant2(detailPageLocator);
            }

            const publishedDateTimeUtc = new Date(
              publishedDateTime,
            ).toISOString();

            await detailPage.close();

            allItems.push({
              ...result,
              image_url_on_list_2: listImageUrlWithoutQueryString,
              image_url_on_detail: detailImageUrl,
              image_url_on_detail_2: detailImageUrlWithoutQueryString,
              local_category: detailLocalCategory ?? null,
              local_tags: detailLocalTags ?? null,
              authors: detailAuthors ?? null,
              short_description: detailShortDescription,
              published_datetime: publishedDateTime,
              published_datetime_utc: publishedDateTimeUtc,
              _internal_index: index,
            });
          }),
        );
      }),
    );

    await context.close();
    await browser.close();

    return allItems;
  } catch (error) {
    throw error;
  }
};
