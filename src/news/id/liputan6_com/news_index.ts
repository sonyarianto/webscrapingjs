import { chromium } from "playwright";
import { excludedResourceTypes } from "../../../config";
import type { News, ScrapeArgument } from "../../../types";

const baseUrlPath = "https://www.liputan6.com/indeks";
const listXpathSelector = 'xpath=//section[@id="indeks-articles"]//article';
const listTitleSelector = "h4.articles--rows--item__title";
const listLinkSelector = "h4 a[href]";
const listImageSelector = "img.articles--rows--item__figure-image-img";
const timeZoneId = "Asia/Jakarta";

export const scrape = async (scrape_argument: ScrapeArgument = {}) => {
  const startPageIndex = scrape_argument.startPageIndex ?? 1;
  const endPageIndex = scrape_argument.endPageIndex ?? startPageIndex;
  let useRemoteBrowser =
    scrape_argument.hasOwnProperty("remoteBrowserUri") &&
    (scrape_argument.remoteBrowserUri as string).length > 0
      ? true
      : false;
  const cdpHost = scrape_argument?.remoteBrowserUri ?? null;

  try {
    if (scrape_argument.verbose ?? false) {
      if (useRemoteBrowser) {
        console.log(`Using remote browser at ${cdpHost}.`);
      } else {
        console.log(`Using built-in chromium browser.`);
      }
    }

    const browser =
      useRemoteBrowser ?? false
        ? await chromium.connectOverCDP(cdpHost as string)
        : await chromium.launch();
    const context = await browser.newContext({
      timezoneId: timeZoneId,
    });

    const allResults: News[] = [];

    for (
      let pageIndex = startPageIndex;
      pageIndex <= endPageIndex;
      pageIndex++
    ) {
      const page = await context.newPage();

      const listUrl = `${baseUrlPath}?page=${pageIndex}`;

      if (excludedResourceTypes.length > 0) {
        await page.route("**/*", (route) => {
          return excludedResourceTypes?.includes(route.request().resourceType())
            ? route.abort()
            : route.continue();
        });
      }

      await page.goto(listUrl);

      const newsList = page.locator(listXpathSelector);

      const totalNews = await newsList.count();

      if (scrape_argument.verbose ?? false) {
        console.log(`Found ${totalNews} data on page index ${pageIndex}.`);
      }

      if (scrape_argument.testListCount ?? false) {
        await page.close();
        await context.close();
        await browser.close();

        return totalNews;
      }

      const results = await newsList.evaluateAll(
        (list, args) =>
          list.map((el) => {
            const news: News = {
              title: null,
              link: null,
              image_url_on_list: null,
              image_url_on_list_2: null,
            };

            let title =
              el.querySelector(args.listTitleSelector)?.textContent?.trim() ??
              null;
            let link =
              (
                el.querySelector(args.listLinkSelector) as HTMLAnchorElement
              )?.href.trim() ?? null;
            let imageUrlOnList =
              (
                el.querySelector(args.listImageSelector) as HTMLImageElement
              )?.src.trim() ?? null;

            const imageUrlOnListWithoutQueryString =
              imageUrlOnList?.split("?")[0];

            return {
              ...news,
              title: title,
              link: link,
              image_url_on_list: imageUrlOnList,
              image_url_on_list_2: imageUrlOnListWithoutQueryString,
            };
          }),
        {
          listTitleSelector: listTitleSelector,
          listLinkSelector: listLinkSelector,
          listImageSelector: listImageSelector,
        },
      );

      await page.close();

      allResults.push(...results);
    }

    if (scrape_argument.testDetailData ?? false) {
      allResults.splice(1);
    }

    await Promise.allSettled(
      allResults.map(async (result, index) => {
        if (!result.link) return;
        if (!result.title) return;

        const page = await context.newPage();

        if (excludedResourceTypes.length > 0) {
          await page.route("**/*", (route) => {
            return excludedResourceTypes?.includes(
              route.request().resourceType(),
            )
              ? route.abort()
              : route.continue();
          });
        }

        await page.goto(result.link);

        if (scrape_argument.verbose ?? false) {
          console.log(`#${index} "${result.title}"`);
        }

        // Get image url on detail

        let imageUrlOnDetail =
          (
            await page
              .locator('xpath=//meta[@property="og:image"]')
              .evaluate((el) => el.getAttribute("content"))
          )?.trim() ?? null;
        result.image_url_on_detail = imageUrlOnDetail;

        // Get image url on detail without query string

        const imageUrlOnDetailWithoutQueryString =
          imageUrlOnDetail?.split("?")[0];
        result.image_url_on_detail_2 = imageUrlOnDetailWithoutQueryString;

        // Get local category

        let localCategory = await page.evaluate(() => {
          const scriptTags = document.querySelectorAll(
            'script[type="application/ld+json"]',
          );
          for (const script of scriptTags) {
            try {
              let data = JSON.parse(script.textContent as string);

              if (data.length > 1) {
                data = data[1];

                if (data["@type"] === "BreadcrumbList") {
                  return data.itemListElement[data.itemListElement.length - 1]
                    .name;
                }
              }
            } catch (error) {
              // Handle JSON parsing errors, if any
            }
          }
          return null; // Return null if not found
        });
        result.local_category = localCategory?.trim() ?? null;

        // Get local tags

        let localTags = await page
          .locator('xpath=//meta[@name="keywords"]')
          .evaluate((el) => el.getAttribute("content")?.trim());
        result.local_tags =
          localTags?.split(",")?.map((tag) => tag.trim()) ?? null;

        // Get authors

        let authors = await page.evaluate(() => {
          const scriptTags = document.querySelectorAll(
            'script[type="application/ld+json"]',
          );
          for (const script of scriptTags) {
            try {
              let data = JSON.parse(script.textContent as string);

              if (data.length > 1) {
                data = data[0];

                if (data["@type"] === "NewsArticle" && data.author) {
                  return data.author.name;
                }
              }
            } catch (error) {
              // Handle JSON parsing errors, if any
            }
          }
          return null; // Return null if not found
        });
        result.authors =
          authors?.split(",")?.map((author) => author.trim()) ?? null;

        // Get short description

        let shortDescription =
          (await page
            .locator('xpath=//meta[@property="og:description"]')
            .evaluate((el) => el.getAttribute("content")?.trim())) ?? null;
        result.short_description = shortDescription;

        // Get published date timestamp

        let publishedDateTime = await page.evaluate(() => {
          const scriptTags = document.querySelectorAll(
            'script[type="application/ld+json"]',
          );
          for (const script of scriptTags) {
            try {
              let data = JSON.parse(script.textContent as string);
              if (data.length > 1) {
                data = data[0];
                if (data["@type"] === "NewsArticle" && data.datePublished) {
                  return data.datePublished;
                }
              }
            } catch (error) {
              // Handle JSON parsing errors, if any
            }
          }
          return null; // Return null if not found
        });
        result.published_datetime = publishedDateTime;

        const publishedDateTimeUtc = new Date(publishedDateTime).toISOString();
        result.published_datetime_utc = publishedDateTimeUtc;

        result.internal_index = index;

        await page.close();
      }),
    );

    await context.close();
    await browser.close();

    return allResults;
  } catch (error) {
    throw error;
  }
};
