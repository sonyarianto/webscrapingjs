import { JSDOM } from "jsdom";
import type { News, ScrapeArgument } from "../../../types";
import {
  getAttributeFromElement,
  getTextContentFromElement,
  getAttributeFromElementThenSplit,
} from "../../../utils";
const baseURLPath = "https://hot.detik.com/indeks/";
const queryStringStart = ""; // e.g. "?page="
const listPageItemsSelector = '//div[@id="indeks-container"]//article';
const listPageTitleSelector = "h3.media__title";
const listPageLinkSelector = "a[href]";
const listPageImageSelector = ".media__image img[src]";
const detailImageURLSelector = 'meta[property="og:image"]';
const detailLocalCategorySelector = "div.page__breadcrumb > a:last-child";
const detailLocalTagsSelector = 'meta[name="keywords"]';
const detailAuthorsSelector = 'meta[name="author"]';
const detailShortDescriptionSelector = 'meta[property="og:description"]';

export const scrape = async (scrape_argument: ScrapeArgument = {}) => {
  let allItems: News[] = [];

  // Start scraping of the list page

  let pageIndexes = Array.from(
    { length: scrape_argument.endPageIndex ?? 1 },
    (_, i) => i + (scrape_argument.startPageIndex ?? 1),
  );

  await Promise.allSettled(
    pageIndexes.map(async (pageIndex) => {
      const listPageURL = `${baseURLPath}${queryStringStart}${pageIndex}`;

      const listPageHTML = await fetch(listPageURL).then((res) => res.text());

      const listPageDOM = new JSDOM(listPageHTML);

      const listPage = listPageDOM.window.document.evaluate(
        listPageItemsSelector,
        listPageDOM.window.document,
        null,
        listPageDOM.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null,
      );

      const countListPageItems = listPage.snapshotLength;

      if (scrape_argument.verbose ?? false) {
        console.log(`P#${pageIndex} C#${countListPageItems} U#${listPageURL}`);
      }

      // Scraping of the list page

      await Promise.allSettled(
        Array.from({ length: countListPageItems }, (_, i) => i).map(
          async (index) => {
            const item: News = {
              _internal_page: pageIndex,
            };

            const listPageItem = listPage.snapshotItem(index);

            // Get listTitle

            let listTitle = getTextContentFromElement(
              listPageItem,
              listPageTitleSelector,
            );

            // Get listLink

            let listLink = getAttributeFromElement(
              listPageItem,
              listPageLinkSelector,
              "href",
            );

            // Get listImageURL

            let listImageURL = getAttributeFromElement(
              listPageItem,
              listPageImageSelector,
              "src",
            );

            // Get listImageURLWithoutQueryString, without query string

            const listImageURLWithoutQueryString =
              listImageURL?.split("?")[0] ?? null;

            // Scraping of the detail page

            const detailPageHTML = await fetch(listLink).then((res) =>
              res.text(),
            );

            const detailPageDOM = new JSDOM(detailPageHTML);

            const detailPage = detailPageDOM.window.document;

            // Get detailImageURL

            let detailImageURL = getAttributeFromElement(
              detailPage,
              detailImageURLSelector,
              "content",
            );

            // Get detailImageURLWithoutQueryString, without query string

            const detailImageURLWithoutQueryString =
              detailImageURL?.split("?")[0] ?? null;

            // Get detailLocalCategory

            let detailLocalCategory = getTextContentFromElement(
              detailPage,
              detailLocalCategorySelector,
            );

            // Get detailLocalTags

            let detailLocalTags = getAttributeFromElementThenSplit(
              detailPage,
              detailLocalTagsSelector,
              ",",
            );

            // Get detailAuthors

            let detailAuthors = getAttributeFromElementThenSplit(
              detailPage,
              detailAuthorsSelector,
              ",",
            );

            // Get detailShortDescription

            let detailShortDescription = getAttributeFromElement(
              detailPage,
              detailShortDescriptionSelector,
              "content",
            );

            // Get detailPublishedDateTime

            let detailPublishedDateTime =
              Array.from(
                detailPage.querySelectorAll(
                  'script[type="application/ld+json"]',
                ),
              )
                .map((script) =>
                  JSON.parse(
                    ((script as HTMLMetaElement).textContent as string) || "{}",
                  ),
                )
                .find(
                  (json) => json["@type"] === "WebPage" && json.datePublished,
                )?.datePublished || null;

            // Get detailPublishedDateTimeUTC

            let detailPublishedDateTimeUTC =
              new Date(detailPublishedDateTime).toISOString() ?? null;

            // Some data normalization, adjustment, try with other selector, etc.

            // If detailLocalCategory === null then try this

            if (detailLocalCategory === null) {
              detailLocalCategory = getTextContentFromElement(
                detailPage,
                "h3.detail__subtitle",
              );
            }

            // If detailPublishedDateTime === null then try this

            if (detailPublishedDateTime === null) {
              detailPublishedDateTime =
                Array.from(
                  detailPage.querySelectorAll(
                    'script[type="application/ld+json"]',
                  ),
                )
                  .map((script) =>
                    JSON.parse(
                      ((script as HTMLMetaElement).textContent as string) ||
                        "{}",
                    ),
                  )
                  .find(
                    (json) =>
                      json["@type"] === "VideoObject" && json.uploadDate,
                  )?.uploadDate || null;

              detailPublishedDateTimeUTC =
                new Date(detailPublishedDateTime).toISOString() ?? null;
            }

            const itemReady = {
              ...item,
              title: listTitle,
              link: listLink,
              image_url_on_list: listImageURL,
              image_url_on_list_2: listImageURLWithoutQueryString,
              image_url_on_detail: detailImageURL,
              image_url_on_detail_2: detailImageURLWithoutQueryString,
              local_category: detailLocalCategory,
              local_tags: detailLocalTags,
              authors: detailAuthors,
              short_description: detailShortDescription,
              published_datetime: detailPublishedDateTime,
              published_datetime_utc: detailPublishedDateTimeUTC,
              _internal_index: index,
            };

            if (scrape_argument.verbose ?? false) {
              console.log(JSON.stringify(itemReady, null, 2));
            }

            allItems.push(itemReady);
          },
        ),
      );
    }),
  );

  return allItems;
};
