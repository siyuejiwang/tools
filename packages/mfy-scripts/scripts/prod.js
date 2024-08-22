const webpack = require("webpack");
const getConfig = require("../config/webpack.prod.config");
const args = require("../bin/commanders/prod");

const env = args.argumentEnv;

const config = getConfig(env);
try {
  let compiler = webpack(config);

  compiler.run((err, stas) => {
    if (err) {
      console.log(err);
    } else {
      console.log("build successfully");
    }
  });
} catch (error) {
  console.log(error);
}
