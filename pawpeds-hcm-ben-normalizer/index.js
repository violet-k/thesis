import fs from "fs";
import readline from "readline";
import events from "events";
import { getValidStatus } from "./utils/hcmStatus.js";

const FILENAME = "results.csv";

const FILENAME_NORMALIZED = `${FILENAME.split(".")[0]}_normalized.csv`;
const headers = ["ID", "Name", "Sex", "Sire", "Dam", "HCM"];
const wStream = fs.createWriteStream(FILENAME_NORMALIZED, { flags: "a" });
wStream.write(`${headers.join(",")}\n`);

const saveToFile = async ({ id, name, sex, sire, dam, hcm }) => {
  wStream.write(
    `${[id, name, sex, sire, dam, hcm]
      .map((part = "") => part.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()))
      .join(",")}\n`
  );
};

try {
  const rl = readline.createInterface({
    input: fs.createReadStream(FILENAME),
    crlfDelay: Infinity,
  });

  rl.on("line", async (line) => {
    if (line.startsWith("ID")) {
      return;
    }

    let [id, name, sex, sire, dam, hcm] = line
      .split(",")
      .map((part) => part.toLowerCase());

    if (!sex) {
      return;
    }

    hcm = await getValidStatus({ id, hcm });
    if (!hcm) {
      return;
    }

    saveToFile({ id, name, sex, sire, dam, hcm });
  });

  await events.once(rl, "close");

  console.log("Reading file line by line with readline done.");
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
} catch (err) {
  console.error(err);
}
