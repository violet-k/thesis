import fs from 'fs';
import readline from 'readline';
import events from 'node:events';

export class CSVFile {
  constructor(name = 'file') {
    this.filename = `${name}.csv`;
    this.wStream = fs.createWriteStream(this.filename, { flags: 'a' });
    this.rStream = fs.createReadStream(this.filename);
  }

  async write(...data) {
    this.wStream.write(`${data.map((part = '') => String(part)).join(',')}\n`);
  }

  async read(lineCallback = () => {}) {
    try {
      const rl = readline.createInterface({
        input: this.rStream,
        crlfDelay: Infinity,
      });

      rl.on('line', async (line) => {
        lineCallback(line);
      });

      await events.once(rl, 'close');

      console.log('Reading file line by line with readline done.');
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(
        `The script uses approximately ${Math.round(used * 100) / 100} MB`
      );

      return;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
