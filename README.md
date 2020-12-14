# Eleventy Plugin - Webpack

Install:

```
npm install @jamshop/eleventy-plugin-webpack
```

## Usage

In you main config `.eleventy.js`: 
```js
const pluginWebpack = require("@jamshop/eleventy-plugin-webpack");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(pluginWebpack, {
    entryPoints: {
      main: "src/index.js"
    }
    output: "_site/js",
    configFunction, // A function that recieves a webpack config to modify and return
  });
  // and the rest of your config
};
```

This will transpile JavaScript in`src/index.js` to `_site/js/main.js`. 

Their are 3 main options, `entryPoints` which is required and should contain a set of key/value pairs. The key represents the output file name (without extensions) and the value is the path to the source file. 

The second option `output` is optional although required in most situations. This is the output directory for the transpiled JavaScript. The generated file path will be a combination of the key and the `output`.

The third option `configFunction` allows you to modify the webpack config.
