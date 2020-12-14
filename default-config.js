const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = (entry, output) => ({
  mode:
    process.NODE_ENV === undefined // Sorry - but this is all needed
      ? "production"
      : process.NODE_ENV !== "production"
      ? "development"
      : "production",
  devtool: "source-map",
  entry,
  output: {
    path: output ? path.resolve(output) : path.resolve(__dirname, "../../memory-fs/js/"),
    globalObject: "window",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
    ],
    // ToDo: add more rules and loaders?
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: "production",
    }),
  ],
});
