# webscrapingjs
Scraping the web with confident.

## Introduction

`webscrapingjs` goals is to create as many as scraper scripts from various topics/categories and web sources. It's like a collection of scraper scripts targeting various web.

## How to run

On this directory, run the following command:

```bash
npm install
```

This will install all the dependencies needed to run the project and create a `node_modules` directory.

We provide quick example `example.ts` and you can try that by running this command.

```js
npx jiti example.ts
```

Note: jiti is my favorite runtime TypeScript and ESM support for Node.

Here is the sample of the results.

```json
[
  {
    "title": "Cak Imin soal Gugatan Usia Capres-cawapres: Masih Aja Ribet Aturan",
    "link": "https://news.detik.com/pemilu/d-6953111/cak-imin-soal-gugatan-usia-capres-cawapres-masih-aja-ribet-aturan",
    "image_url_on_list": "https://awsimages.detik.net.id/community/media/visual/2023/09/23/cak-imin-memakai-kaus-nu-wildandetikcom_43.jpeg?w=210&q=90",
    "image_url_on_list_2": "https://awsimages.detik.net.id/community/media/visual/2023/09/23/cak-imin-memakai-kaus-nu-wildandetikcom_43.jpeg",
    "image_url_on_detail": "https://awsimages.detik.net.id/api/wm/2023/09/23/cak-imin-memakai-kaus-nu-wildandetikcom_169.jpeg?wid=54&w=650&v=1&t=jpeg",
    "image_url_on_detail_2": "https://awsimages.detik.net.id/api/wm/2023/09/23/cak-imin-memakai-kaus-nu-wildandetikcom_169.jpeg",
    "local_category": "Pemilu",
    "local_tags": [
      "cak imin",
      "gugatan usia cawapres",
      "mk",
      "pilpres 2024",
      "politik"
    ],
    "authors": ["Kadek Melda Luxiana"],
    "short_description": "Ketum PKB Muhaimin Iskandar atau Cak Imin menyoroti gugatan batas usia capres dan cawapres yang belum putus di Mahkamah Konstitusi (MK).",
    "published_datetime": "2023-09-27T14:00:06+07:00",
    "published_datetime_utc": "2023-09-27T07:00:06.000Z",
    "internal_index": 18
  },
  {
    "title": "Rafael Alun Dapat Dana Taktis Konsultan Pajak karena Bawa Banyak Klien Besar",
    "link": "https://news.detik.com/berita/d-6953100/rafael-alun-dapat-dana-taktis-konsultan-pajak-karena-bawa-banyak-klien-besar",
    "image_url_on_list": "https://awsimages.detik.net.id/community/media/visual/2023/09/27/sidang-rafael-alun-yogi-detikcom_43.jpeg?w=210&q=90",
    "image_url_on_list_2": "https://awsimages.detik.net.id/community/media/visual/2023/09/27/sidang-rafael-alun-yogi-detikcom_43.jpeg",
    "image_url_on_detail": "https://awsimages.detik.net.id/api/wm/2023/09/27/sidang-rafael-alun-yogi-detikcom_169.jpeg?wid=54&w=650&v=1&t=jpeg",
    "image_url_on_detail_2": "https://awsimages.detik.net.id/api/wm/2023/09/27/sidang-rafael-alun-yogi-detikcom_169.jpeg",
    "local_category": "Berita",
    "local_tags": ["rafael alun trisambodo", "kpk", "hukum"],
    "authors": ["Yogi Ernes"],
    "short_description": "Jaksa pada KPK mencecar soal dana taktis perusahaan konsultan pajak yang terafiliasi dengan mantan Pejabat Ditjen Pajak Rafael Alun Trisambodo.",
    "published_datetime": "2023-09-27T13:54:54+07:00",
    "published_datetime_utc": "2023-09-27T06:54:54.000Z",
    "internal_index": 19
  }
]
```

As you can see the script basically call the `scrape()` function on the imported module. You can extend the logic by saving the results to database or any further processing logic.

## Testing

We are using Vitest for running test. The test purpose is very crucial here to detect any possible problem on each scraper script. If there are failed tests means we have to pay attention to that problem because maybe there are changes on the source website (DOM structure, class name changes, selector ID changes etc).

```bash
npm run test
```

## Additional information

Implementing a scraper is not an easy task. You need to know how to use the browser automation library, how to use the Chrome DevTools Protocol, and how to use the DOM API. You also need to know how to use the `async/await` syntax and how to use `Promise`. If you are not familiar with these concepts, I suggest you to learn them first before trying to implement a scraper. Our target is create as many as possible scraper for many public services. So, we need to make sure that the code is easy to understand and easy to maintain.

At some point maybe you will need to dealing with proxy, captcha, or other things that can make your scraper fail. You need to know how to handle these things and always make sure that your scraper is working properly.

Scraping implementation usually involves a lot of trial and error. You need to try many things to make sure that your scraper is working properly. You need to know how to debug your scraper and how to fix the problem. In real world scenario you also likely to put a scraper in a server and run it periodically so you can get always fresh data.

Long story short, it's complicated. But, it's also fun.

## Using remote browser

If you want to use remote browser to do the scraping, I suggest using Browserless instance, we use Docker to run it. You can follow the instruction [here](https://docs.browserless.io/docs/docker.html) to install it on your machine. On each script we can configure to use remote browser (via Chrome DevTools Protocol) by setting the `remoteBrowserUri` on `scrape()` function argument. Just see the source code for the details.

## Questions and professional services

If you have any questions, please drop an issue on this repository. Professional support and consulting is also available, please contact me at <<sony@sony-ak.com>>

## Sponsor

If you like this project, please consider to sponsor me on this repository. Your sponsorship will help us to maintain this project and create more open source projects in the future. Thank you.

## License

MIT

Maintained by Sony Arianto Kurniawan <<sony@sony-ak.com>> and contributors.

