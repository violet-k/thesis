import {
  FILENAME,
  FILENAME_NORMALIZED,
  readData,
  writeRow,
} from './utils/file.js';
import { normalize } from './utils/normalize.js';
import fs from 'fs';

if (fs.existsSync(FILENAME_NORMALIZED)) {
  fs.unlinkSync(FILENAME_NORMALIZED);
}

const data = await readData(FILENAME);

Object.values(data).forEach(async (cat) => {
  const row = await normalize(cat);
  if (!row) {
    return;
  }
  writeRow(row);
});
