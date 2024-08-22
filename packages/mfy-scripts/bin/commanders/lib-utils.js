const { Command } = require("commander");
const libUtils = new Command("lib-utils");
const pkg = require("../../package.json");

libUtils.description(pkg.description).version(pkg.version);

class CommandOptions {
  constructor(opts) {
    this.entry = opts.entry;
  }
}

const handler = (cb) => {
  libUtils
    .description("Build esm and umd packages of pure js library.")
    .option(
      "--entry <entry_folder>",
      "The folder where to start.",
      "src/index.ts"
    )
    .option("--analyzer", "Run webpack bundle analyzer plugin.", false)
    .option(
      "--externals",
      "Assign new externals to webpack config, use default externals if not assigned."
    )
    .action((opts) => {
      typeof cb === "function" && cb(new CommandOptions(opts));
    });

  libUtils.parse(process.argv);
};

module.exports = handler;
