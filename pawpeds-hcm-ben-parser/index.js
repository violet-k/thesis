import { PawpedsBenApi } from "./api/pawpedsBenApi.js";
import { scrapeCat } from "./utils/cat.js";
import { chunk, executeChunks } from "./utils/chunks.js";

const totalNumber = await PawpedsBenApi.getTotalNumber();

const range = (start, stop, step = 1) =>
  Array.from(
    { length: (stop - start) / step + 1 },
    (_, index) => start + index * step
  );

const ids = range(100000, totalNumber);

const groupedIdList = chunk(ids, 5);

await executeChunks(groupedIdList, scrapeCat);
