import { scrape } from "./src/news/id/detik_com/news_index";

// possible scrape() argument:
// { startPageIndex: 1, endPageIndex: 2, verbose: true}
// { testListCount: true }
// { testDetailData: true }
// { verbose: true }
// { testDetailData: true, verbose: true }
// { testListCount: true, verbose: true }
// { remoteBrowserUri: "ws://localhost:3000"

(async () => {
  const results = await scrape({ verbose: true });

  console.log(JSON.stringify(results, null, 2));
})();
