// I'm trying to avoid passing eleventyConfig around in utils
// but this utility really should own adding events and the counter
// so, I'm making an excption
const addCachedGlobalData = async (eleventyConfig, cb, key) => {
  // Compile once to prime cache (data varaiable is our cache) and add watch targets
  let data = await cb();
  let buildCounter = 0;
  let lastCompile = 0;

  // After each build increment the build counter
  eleventyConfig.on("afterBuild", () => {
    buildCounter++;
  });

  // If this is a function 11ty will attempt to resolve the data
  // If it is async 11ty will add the key scss and resolve data when called
  eleventyConfig.addGlobalData(key, async () => {
    // if the lastCompile can buildCounter don't match the cached data
    if (lastCompile !== buildCounter) {
      lastCompile = buildCounter;
      // console.count(`Running ${key}`);
      data = await cb();
    }
    return data;
  });
};

module.exports = {
  addCachedGlobalData,
};
