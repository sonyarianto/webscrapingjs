import { Locator } from "playwright";

export const isValidDate = (dateString: string) => {
  const dateObject = new Date(dateString);
  return !isNaN(dateObject.getTime());
};

export async function browserSelector(browser: any, scrape_argument: any) {
  return (scrape_argument.hasOwnProperty("remoteBrowserUri") &&
  (scrape_argument.remoteBrowserUri as string).length > 0
    ? true
    : false) ?? false
    ? await browser.connectOverCDP(
        (scrape_argument?.remoteBrowserUri ?? null) as string,
      )
    : await browser.launch();
}

export async function processExcludedResourceTypes(
  page: any,
  excluded_resource_types: string[],
) {
  if (excluded_resource_types.length > 0) {
    await page.route("**/*", (route: any) => {
      return excluded_resource_types?.includes(route.request().resourceType())
        ? route.abort()
        : route.continue();
    });
  }
}

export function verboseBrowserUsed(scrape_argument: any) {
  if (scrape_argument.verbose ?? false) {
    if (
      scrape_argument.hasOwnProperty("remoteBrowserUri") &&
      (scrape_argument.remoteBrowserUri as string).length > 0
        ? true
        : false
    ) {
      console.log(
        `#remote browser ${
          (scrape_argument?.remoteBrowserUri ?? null) as string
        }.`,
      );
    } else {
      console.log(`#built-in browser chromium.`);
    }
  }
}

export async function getAttributeFromLocatorSelector(
  locator: Locator,
  selector: string,
  attribute: string,
) {
  return await locator.evaluate(
    (el, args) => {
      const element = el.querySelector(args.selector);
      return element ? element.getAttribute(args.attribute)?.trim() : null;
    },
    {
      selector: selector,
      attribute: attribute,
    },
  );
}

export async function getTextContentFromLocatorSelector(
  locator: Locator,
  selector: string,
) {
  return await locator.evaluate(
    (el, args) => {
      const element = el.querySelector(args.selector);
      return element ? element.textContent?.trim() : null;
    },
    {
      selector: selector,
    },
  );
}

// export async function getArrayFromLocatorSelector(
//   locator: Locator,
//   selector: string,
// ) {
//   return await locator.evaluate(
//     (el, args) => {
//       const elements = el.querySelectorAll(args.selector);
//       return Array.from(elements).map((element) => element.textContent?.trim());
//     },
//     {
//       selector: selector,
//     },
//   );
// }

export async function getArrayFromLocatorSelector(
  locator: Locator,
  selector: string,
) {
  const result = await locator.evaluate(
    (el, args) => {
      const elements = el.querySelectorAll(args.selector);
      return Array.from(elements).map((element) => element.textContent?.trim());
    },
    {
      selector: selector,
    },
  );

  if (result.length === 0) {
    return null;
  }

  return result;
}

export async function getArraySplitFromAttributeFromLocatorSelector(
  locator: Locator,
  selector: string,
  attribute: string,
  split: string,
) {
  const result = await locator.evaluate(
    (el, args) => {
      const element = el.querySelector(args.selector) as HTMLMetaElement;
      return element?.content?.trim().split(args.split);
    },
    {
      selector: selector,
      attribute: attribute,
      split: split,
    },
  );

  if (result.length === 0) {
    return null;
  }

  return result;
}

export async function getPublishedDatetimeVariant1(locator: Locator) {
  return await locator.evaluate((el) => {
    const scriptTags = el.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    for (const script of scriptTags) {
      try {
        const data = JSON.parse(script.textContent as string);
        if (data["@type"] === "WebPage" && data.datePublished) {
          return data.datePublished;
        }
      } catch (error) {
        // Handle JSON parsing errors, if any
      }
    }
    return null; // Return null if not found
  });
}

export async function getPublishedDatetimeVariant2(locator: Locator) {
  return await locator.evaluate((el) => {
    const scriptTags = el.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    for (const script of scriptTags) {
      try {
        const data = JSON.parse(script.textContent as string);
        if (data["@type"] === "VideoObject" && data.uploadDate) {
          return data.uploadDate;
        }
      } catch (error) {
        // Handle JSON parsing errors, if any
      }
    }
    return null; // Return null if not found
  });
}
