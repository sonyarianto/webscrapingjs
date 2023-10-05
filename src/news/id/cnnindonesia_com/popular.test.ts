import { expect, test } from "vitest";
import { scrape } from "./popular";
import { News } from "../../../types";
import { isValidDate } from "../../../utils";
import { defaultTestTimeout } from "../../../config";

const sourceLabel = "cnnindonesia.com/terpopuler";

test(
  `${sourceLabel}: all data valid`,
  async () => {
    const results = await scrape();

    expect(results.data.length).toBeGreaterThan(0);

    const expectedSubset = {
      strjudul: expect.any(String),
      articleUrl: expect.any(String),
    };

    results.data.forEach((result) => {
      expect(result).toMatchObject(expectedSubset);
      expect(result.strjudul).toBeTruthy();
      expect(result.articleUrl).toBeTruthy();
    });
  },
  defaultTestTimeout,
);
