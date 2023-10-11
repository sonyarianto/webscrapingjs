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
    "_internal_page": 1,
    "title": "Bertemu PM Azerbaijan, MenPAN-RB: Kita Akan Terus Perkuat Kolaborasi",
    "link": "https://news.detik.com/berita/d-6975988/bertemu-pm-azerbaijan-menpan-rb-kita-akan-terus-perkuat-kolaborasi",
    "image_url_on_list": "https://awsimages.detik.net.id/community/media/visual/2023/10/11/kemenpan-rb-1_43.jpeg?w=210&q=90",
    "image_url_on_list_2": "https://awsimages.detik.net.id/community/media/visual/2023/10/11/kemenpan-rb-1_43.jpeg",
    "image_url_on_detail": "https://awsimages.detik.net.id/api/wm/2023/10/11/kemenpan-rb-1_169.jpeg?wid=54&w=650&v=1&t=jpeg",
    "image_url_on_detail_2": "https://awsimages.detik.net.id/api/wm/2023/10/11/kemenpan-rb-1_169.jpeg",
    "local_category": "Berita",
    "local_tags": [
      "kemenpanrb",
      "kemenpan rb"
    ],
    "authors": [
      "Hana Nushratu Uzma"
    ],
    "short_description": "Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi (MenPAN-RB) Abdullah Azwar Anas bertemu Perdana Menteri (PM) Azerbaijan Ali Asadov di Baku.",
    "published_datetime": "2023-10-11T09:15:30+07:00",
    "published_datetime_utc": "2023-10-11T02:15:30.000Z",
    "_internal_index": 8
  }
]
```

As you can see the script basically call the `scrape()` function on the imported module. You can extend the logic by saving the results to database or any further processing logic.

## Testing

We are using Vitest for running test. The test purpose is very crucial here to detect any possible problem on each scraper script. If there are failed tests means we have to pay attention to that problem because maybe there are changes on the source website (DOM structure, class name changes, selector ID changes etc).

```bash
npm run test

# or target specific directory that contains phrase
# npm run test -- detik_com
```

## Scraping techniques

Each script usually will use various technique to do the scraping. Here are the list of techniques that we use:

- [x] Scraping using fetch API and JSDOM (for non JavaScript rendered website)

## Questions and professional services

If you have any questions, please drop an issue on this repository. Professional support and consulting is also available, please contact me at <<sony@sony-ak.com>>.

## Sponsor

If you like this project, please consider to sponsor me on this repository. Your sponsorship will help us to maintain this project and create more open source projects in the future. Thank you.

## License

MIT

Maintained by Sony Arianto Kurniawan <<sony@sony-ak.com>> and contributors.
