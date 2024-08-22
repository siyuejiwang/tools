const getUmdConfig = require("../config/webpack.umd.config.js");
const webpack = require("webpack");

// @todo Get from args, not index.
let env = process.argv[process.argv.length - 1];

if (!env) {
  console.warn("your env is null");
}

function runWebpack() {
  webpack(getUmdConfig(env)).run((err, status) => {
    if (err) {
      return console.log(err);
    }
    const info = status.toJson();
    if (status.hasErrors()) {
      console.error("build library umd fail =>", info.errors);
    } else if (status.hasWarnings()) {
      console.warn(
        "build library umd successfully with warnings",
        info.warnings
      );
    } else {
      console.log("build library umd successfully");
    }
  });
}
runWebpack();
