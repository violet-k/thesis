import {
  chunk,
  executeChunks,
} from '../pawpeds-hcm-ben-parser/utils/chunks.js';
import { FILENAME_NORMALIZED, readData, writeRow } from './utils/file.js';
import { scrape } from '../pawpeds-hcm-ben-parser/utils/browser.js';

const BASE_URL = 'https://www.pawpeds.com/db/';

const getCatInfo = async (page) => {
  return page.evaluate(async () => {
    // get cat info
    let name = null;
    let sex = null;
    const title = document.querySelector('tr > th').innerText.split(',');

    title.forEach((part, index) => {
      part = part.trim();
      if (index === 0) {
        name = part;
      }

      if (part === 'M' || part === 'F') {
        sex = part;
      }
    });

    return { name, sex };
  });
};

const scrapeCat = async (id) => {
  console.log({ id });
  const hcm = 'Normal';
  const sire = '';
  const dam = '';

  const { name, sex } = await scrape({
    url: `${BASE_URL}?a=p&id=${id}&g=4&p=ben`,
    callback: getCatInfo,
  });

  writeRow({ id, name, sex, sire, dam, hcm });
};

const data = await readData(FILENAME_NORMALIZED);

let ids = new Set(
  Object.values(data).reduce((acc, { sire, dam }) => {
    if (sire !== '' && !data[sire]) {
      acc.push(sire);
    }
    if (dam !== '' && !data[dam]) {
      acc.push(dam);
    }

    return acc;
  }, [])
);
ids = [...ids];

const groupedIdList = chunk(ids, 5);

await executeChunks(groupedIdList, scrapeCat);
