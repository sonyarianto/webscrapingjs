export interface News {
  title?: string | null;
  sub_title?: string | null;
  link?: string | null;
  published_datetime?: string | null;
  published_datetime_utc?: string | null;
  image_url_on_list?: string | null;
  image_url_on_list_2?: string | null;
  image_url_on_detail?: string | null;
  image_url_on_detail_2?: string | null;
  local_category?: string | null;
  local_sub_category?: string | null;
  local_tags?: string[] | null;
  short_description?: string | null;
  authors?: string[] | null;
  _internal_page?: number | null;
  _internal_index?: number | null;
}

export interface ScrapeArgument {
  startPageIndex?: number; // not all scraper support this
  endPageIndex?: number; // not all scraper support this
  testListCount?: boolean; // used by test runner to check if the scraper is working properly, check the number of data on the list page
  testDetailData?: boolean; // used by test runner to check if the scraper is working properly, check the detail data completeness
  verbose?: boolean; // toggle for verbose logging, default to false, means no logging
  remoteBrowserUri?: string; // e.g. "ws://...", if not provided, use built-in chromium, if provided, use remote chromium defined by the uri
}
