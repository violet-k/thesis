import fs from 'fs';
import readline from 'readline';
import events from 'node:events';

export const FILENAME = 'results.csv';
export const FILENAME_NORMALIZED = `${FILENAME.split('.')[0]}_normalized.csv`;
export const headers = ['ID', 'Name', 'Sex', 'Sire', 'Dam', 'HCM'];
let wStream = null;

export const writeRow = async ({ id, name, sex, sire, dam, hcm }) => {
  if (!wStream) {
    wStream = fs.createWriteStream(FILENAME_NORMALIZED, { flags: 'a' });
    wStream.write(`${headers.join(',')}\n`);
  }

  wStream.write(
    `${[id, name, sex, sire, dam, hcm]
      .map((part = '') => {
        if (!part) {
          part = '';
        }
        return part.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      })
      .join(',')}\n`
  );
};

export const readData = async (filename) => {
  const data = {};
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(filename),
      crlfDelay: Infinity,
    });

    rl.on('line', async (line) => {
      if (line.startsWith('ID')) {
        return;
      }

      let [id, name, sex, sire, dam, hcm] = line
        .split(',')
        .map((part) => part.toLowerCase());

      data[id] = { id, name, sex, sire, dam, hcm };
    });

    await events.once(rl, 'close');

    console.log('Reading file line by line with readline done.');
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
      `The script uses approximately ${Math.round(used * 100) / 100} MB`
    );

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
