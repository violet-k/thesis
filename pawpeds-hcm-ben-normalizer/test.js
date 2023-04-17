import { FILENAME_NORMALIZED, readData } from './utils/file.js';

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

console.log(Object.values(data).length, ids.length);
