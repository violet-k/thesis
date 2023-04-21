import { CSVFile } from './utils/CSVFile.js';

const normalizedFile = new CSVFile('results_normalized');
const convertedFile = new CSVFile('converted');

const data = {};
const readCallback = (line) => {
  if (line.startsWith('ID')) {
    return;
  }

  let [id, name, sex, sire, dam, hcm] = line
    .split(',')
    .map((part) => part.toLowerCase());

  data[id] = { id, name, sex, sire, dam, hcm };
};
await normalizedFile.read(readCallback);

convertedFile.write([
  'ID',
  'Sex',
  'Has_HCM',
  'Sire_ID',
  'Sire_has_HCM',
  'Dam_ID',
  'Dam_has_HCM',
]);
Object.values(data).forEach(({ id, sex, sire, dam, hcm }) => {
  convertedFile.write([
    id,
    sex,
    hcm === 'hcm',
    sire,
    data[sire]?.hcm === 'hcm',
    dam,
    data[dam]?.hcm === 'hcm',
  ]);
});
