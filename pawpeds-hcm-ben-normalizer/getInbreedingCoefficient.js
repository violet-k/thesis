import {
    chunk,
    executeChunks,
} from '../pawpeds-hcm-ben-parser/utils/chunks.js';
import { CSVFile } from './utils/CSVFile.js';
import { FILENAME_NORMALIZED, readData } from './utils/file.js';

const BASE_URL = 'https://www.pawpeds.com/db/';

const newFile = new CSVFile(
    'results_normalized_inbreeding',
    ['ID', 'Name', 'Sex', 'Sire', 'Dam', 'HCM', 'Inbreeding']
);

const getInbreedingCoefficient = async (id) => fetch(`https://www.pawpeds.com/db/?a=apici&id=${id}&g=10&p=ben`, {
    method: 'GET'
})
    .then(response => response.json())
    .then(result => {
        const inbreedingCoefficient = parseFloat(result[0]);
        console.log({ id, inbreedingCoefficient });
        newFile.write([...Object.values(data[id]), inbreedingCoefficient]);
    })

const data = await readData(FILENAME_NORMALIZED);

let ids = new Set(
    Object.values(data).map(({ id }) => id)
);
ids = [...ids];

const groupedIdList = chunk(ids, 5);

await executeChunks(groupedIdList, getInbreedingCoefficient);