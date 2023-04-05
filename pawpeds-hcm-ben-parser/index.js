import { PawpedsBenApi } from './pawpedsBenApi.js';
import fs from 'fs';

const addCat = (
  result,
  { id, name = null, sex = null, sire = null, dam = null, hcm = null }
) => {
  if (!result[id]) {
    result[id] = { id, name, sex, sire, dam, hcm };
    return;
  }

  result[id].id = id;

  if (name) {
    result[id].name = name;
  }

  if (sex) {
    result[id].sex = sex;
  }

  if (sire) {
    result[id].sire = sire;
  }

  if (dam) {
    result[id].dam = dam;
  }

  if (hcm) {
    result[id].hcm = hcm;
  }
};

const totalNumber = await PawpedsBenApi.getTotalNumber();

const ids = Array.from({ length: totalNumber }, (_, i) => i + 1);

const result = {};

const chunk = (arr, size) =>
  [...Array(Math.ceil(arr.length / size))].map((_, i) =>
    arr.slice(size * i, size + size * i)
  );

const groupedIdList = chunk(ids, 5);

await Promise.all(
  groupedIdList.map((idList) => {
    return Promise.all(
      idList.map(async (id) => {
        const hcm = await PawpedsBenApi.getHealth(id);

        if (!hcm) {
          return;
        }

        const { name, sex, sire, dam } = await PawpedsBenApi.getCatInfo(id);

        console.log({ id, name, sex, sire, dam, hcm });

        addCat(result, { id, name, sex, sire, dam, hcm });
      })
    );
  })
);

const headers = ['ID', 'Name', 'Sex', 'Sire', 'Dam', 'HCM'];
const csvString = [
  headers,
  ...Object.values(result).map(({ id, name, sex, sire, dam, hcm }) => [
    id,
    name,
    sex,
    sire,
    dam,
    hcm,
  ]),
]
  .map((e) => e.join(','))
  .join('\n');

const writeStream = fs.createWriteStream('result.csv');
writeStream.write(csvString);
