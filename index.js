const webpack = require("webpack");
const MemoryFileSystem = require("memory-fs");
const mfs = new MemoryFileSystem();
const fs = require("fs-extra");
const getDefaultConfig = require("./default-config");
const { addCachedGlobalData } = require("./utils");

const extractFiles = (compilerResult) =>
  Object.keys(compilerResult.assets).reduce((acc, key) => {
    acc[key] = compilerResult.assets[key].source();
    return acc;
  }, {});

const runCompiler = async (compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        const errors =
          err || (stats.compilation ? stats.compilation.errors : null);
        console.log(errors);
        reject(errors);
        return;
      }
      const { compilation } = stats;
      const resources = compilation.modules.map((mod) => mod.resource);
      const files = extractFiles(compilation);
      resolve(files, resources);
    });
  });

const webpackPlugin = (
  eleventyConfig,
  { configFunction, entryPoints = {}, output } = {}
) => {
  if (Object.entries(entryPoints).length === 0) {
    // If the plugin is used a key may be expected by the theme
    // return an empty object if no JS

    if (eleventyConfig.addGlobalData) {
      eleventyConfig.addGlobalData("webpack", {});
    }

    console.log(`No js entryPoints found.`);
    console.log(
      `Plugin expects data to be in the shape: entryPoints: { name: "path/to/file.js"}`
    );
    return;
  }

  
  let config = getDefaultConfig(entryPoints, output);

  // If the user specifies a configFunction allow them to extend
  // the config before creating the compiler
  if (configFunction) {
    config = configFunction(config);
  }

  const compiler = webpack(config);
  
  if(!output) {
    // Fetches files from the node filesystem
    // and outputs to memory files system
    compiler.outputFileSystem = mfs;
    compiler.inputFileSystem = fs;
    compiler.resolvers.normal.fileSystem = mfs;
  } else {
    fs.ensureDirSync(output);
  }

  const doBuild = () => {
    if (eleventyConfig.addGlobalData) {
      addCachedGlobalData(
        eleventyConfig,
        async () => {
          const data = await runCompiler(compiler);
          return data;
        },
        "webpack"
      );
    } else {
      return runCompiler(compiler);
    }
  }
  doBuild();

   // Ideally we'd add a watch for each module consumed by the entry, 
   // but the compiler is async and as yet there is no way to await this in a plugin
   let watchPaths = [];
   Object.entries(entryPoints).forEach(([_, watchPath]) => {
     watchPaths.push(watchPath);
     eleventyConfig.addWatchTarget(watchPath);
   });
   eleventyConfig.on("beforeWatch", (changedFiles) => {
     // Run me before --watch or --serve re-runs
     if(watchPaths.some(watchPath => changedFiles.includes(watchPath))) {
       doBuild();
     }
   });

};

module.exports = webpackPlugin;
