import { expect, test } from "vitest";
import { scrape } from "./news_index";
import { News } from "../../../types";
import { isValidDate } from "../../../utils";
import { defaultTestTimeout } from "../../../config";

const sourceLabel = "cnnindonesia.com/indeks";

test(
  `${sourceLabel}: news list cannot empty`,
  async () => {
    const count = await scrape({ testListCount: true });

    expect(count).toBeGreaterThan(0);
  },
  defaultTestTimeout,
);

test(
  `${sourceLabel}: detail data OK (only check first data)`,
  async () => {
    const results: News = (await scrape({ testDetailData: true })) as News;

    const result = results[0] ?? {};

    const expectedSubset = {
      title: expect.any(String),
      link: expect.any(String),
      image_url_on_list: expect.any(String),
      published_datetime_utc: expect.any(String),
      authors: expect.any(Array),
    };

    expect(result).toMatchObject(expectedSubset);
    expect(isValidDate(result.published_datetime_utc as string)).toBe(true);
    expect(result.title).not.toBe("");
    expect(result.link).not.toBe("");
    expect(result.image_url_on_list).not.toBe("");
    expect(result.published_datetime).not.toBe(null);
  },
  defaultTestTimeout,
);
