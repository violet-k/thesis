import fs from 'fs';
import { PawpedsBenApi } from '../api/pawpedsBenApi.js';

const FILENAME = 'results.csv';
const headers = ['ID', 'Name', 'Sex', 'Sire', 'Dam', 'HCM'];

const stream = fs.createWriteStream(FILENAME, { flags: 'a' });
stream.write(`${headers.join(',')}\n`);

const saveToFile = async ({ id, name, sex, sire, dam, hcm }) => {
  stream.write(`${[id, name, sex, sire, dam, hcm].join(',')}\n`);
};

const scrapeCat = async (id) => {
  console.log({ id });
  const hcm = await PawpedsBenApi.getHealth(id);

  if (!hcm) {
    return;
  }

  const { name, sex, sire, dam } = await PawpedsBenApi.getCatInfo(id);

  console.log({ id, name, sex, sire, dam, hcm });

  saveToFile({ id, name, sex, sire, dam, hcm });
};

export { scrapeCat };
