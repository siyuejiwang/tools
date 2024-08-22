const { isValidProEnv, WHITE_ENV_LIST } = require("./is-valid-pro-env");

const { Command } = require("commander");
const pkg = require("../../package.json");
const program = new Command("prod");

function dropWildcardSymbolInWin() {
  const WILDCARD = "$*";
  if (process.platform === "win32") {
    const i = process.argv.indexOf(WILDCARD);
    if (i > -1) {
      process.argv.splice(i, 1);
    }
  }
}

dropWildcardSymbolInWin();

/**
 * 打包环境参数
 */
let argumentEnv;

program
  .option("-l, --log", "Print arguments", false)
  .option("--case [name]", "Specifies webpack inject CASE variable.", "goodwe")
  .option("--appcode [code]", "Specifies webpack inject APPCODE variable.", "")
  .option(
    "--html-template <file>",
    "Specifies the HtmlWebpackPlugin template.",
    "public/index.html"
  )
  .option("--mock", "Whether to enable mock data.", false)
  .option("--micro", "Determine whether started as a micro app.", false)
  .option("--analyzer", "Run webpack bundle analyzer plugin.", false)
  .arguments("<env>")
  .action((env) => {
    /**
     * get argument env.
     * @type {string}
     */
    argumentEnv = env;
  });
  
program.parse(process.argv);
if (program.log) {
  console.log("[log]", "arguments", {
    ...program.opts(),
    argumentEnv,
  });
}

if (!isValidProEnv(argumentEnv)) {
  console.error(
    "[error]",
    `env "${argumentEnv}" is not support. valid value is one of [${WHITE_ENV_LIST}]`
  );
  process.exit(1);
} else {
  console.log("[log]", `env is ${argumentEnv}`);
}

module.exports = {
  ...program.opts(),
  argumentEnv,
};
