var path = require("path");
var webpack = require("webpack");
var TerserPlugin = require('terser-webpack-plugin');
var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');


var config = {
  entry: ["babel-polyfill", "whatwg-fetch", "./src/components/entries/PublicClient.tsx"],

  /*
   * The combination of path and filename tells Webpack what name to give to
   * the final bundled JavaScript file and where to store this file.
   */
  output: {
    path: path.resolve(__dirname, "public/build"),
    filename: "rtb-public.bundle.js"
  },
  /*
   * resolve lets Webpack now in advance what file extensions you plan on
   * "require"ing into the web application, and allows you to drop them
   * in your code.
   */
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      sourceMap: true,
    })],
  },
  plugins: [new HardSourceWebpackPlugin()],
  module: {
    /*
     * Each loader needs an associated Regex test that goes through each
     * of the files you've included (or in this case, all files but the
     * ones in the excluded directories) and finds all files that pass
     * the test. Then it will apply the loader to that file. I haven't
     * installed ts-loader yet, but will do that shortly.
     */
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
module.exports = config;