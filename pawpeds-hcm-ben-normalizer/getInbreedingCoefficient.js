import {
  chunk,
  executeChunks,
} from '../pawpeds-hcm-ben-parser/utils/chunks.js';
import { CSVFile } from './utils/CSVFile.js';
import { FILENAME_NORMALIZED, readData } from './utils/file.js';

const BASE_URL = 'https://www.pawpeds.com/db/';

const inbreedingFile = new CSVFile('results_normalized_inbreeding');

const getInbreedingCoefficient = async (id) => {
  console.log({ id });
  return fetch(`${BASE_URL}?a=apici&id=${id}&g=10&p=ben`, {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      const inbreedingCoefficient = parseFloat(result[0]);
      console.log({ id, inbreedingCoefficient });
      inbreedingFile.write([
        ...Object.values(normalizedData[id]),
        inbreedingCoefficient,
      ]);
    });
};

const inbreedingData = {};
const readCallback = (line) => {
  if (line.startsWith('ID')) {
    return;
  }

  let [id, name, sex, sire, dam, hcm, inbreeding] = line
    .split(',')
    .map((part) => part.toLowerCase());

  inbreedingData[id] = { id, name, sex, sire, dam, hcm, inbreeding };
};
await inbreedingFile.read(readCallback);

// get ids
const normalizedData = await readData(FILENAME_NORMALIZED);
let ids = new Set(
  Object.values(normalizedData).reduce((acc, { id }) => {
    if (!inbreedingData[id]) {
      acc.push(id);
    }
    return acc;
  }, [])
);
ids = [...ids];

const groupedIdList = chunk(ids, 5);

await executeChunks(groupedIdList, getInbreedingCoefficient);
