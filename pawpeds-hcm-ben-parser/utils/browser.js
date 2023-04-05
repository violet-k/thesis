import puppeteer from "puppeteer";

const browser = await puppeteer.launch();

const scrape = async ({ url = "", callback = async () => {} }) => {
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const result = await callback(page);

  await page.close();

  return Promise.resolve(result);
};

const scrapeAll = async ({ urls = [], callback = async () => {} }) => {
  return Promise.all(
    urls.map(async (url) => {
      console.log({ url });
      return scrape({ url, callback });
    })
  );
};

export { scrape, scrapeAll };
