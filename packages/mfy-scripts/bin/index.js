#!/usr/bin/env node

const spawn = require("cross-spawn");
const chalk = require("@gw/gw-helpers/chalk");
/**
 * 获取脚本入参
 * e.g: gw-scripts lib-components --app-packages=src prod
 * args: [ 'lib-components', '--app-packages=src', 'prod' ]
 * @type {string[]}
 */
const args = process.argv.slice(2);

// gw-scripts支持的脚本，如果有新增加的命令，请在此处添加命令名称
const commanders = [
  "develop",
  "prod",
  "test",
  "remote",
  "lib-umd",
  "lib-esm",
  "lib-components",
  "lib-utils",
];
const scriptIndex = args.findIndex((x) => commanders.includes(x));

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (commanders.includes(script)) {
  /**
   * @returns result
   * {
   *    status: 0,
   *    singal: null,
   *    output: [],
   *    pid: xx,
   *    error: '',
   *    ...
   * }
   */
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve("../scripts/" + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: "inherit" }
  );

  if (result.signal) {
    console.log(`build error : signal = ${result.signal}`);
    console.log(`result = ${JSON.stringify(result)}`);
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log();
  console.log(chalk.red(`not exist script : ${script}`));
  console.log();
  console.log(chalk.cyan("you can run develop or prod"));
}
