const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chunk = (arr, size) =>
  [...Array(Math.ceil(arr.length / size))].map((_, i) =>
    arr.slice(size * i, size + size * i)
  );

const executeChunks = async (chunksArr, f) => {
  const _executeChunk = async (chunk) => {
    return Promise.all(chunk.map(f)).then(() => {
      sleep(5000);
      if (chunksArr.length) {
        _executeChunk(chunksArr.shift());
      } else {
        resolve();
      }
    });
  };

  return _executeChunk(chunksArr.shift());
};

export { chunk, executeChunks };
