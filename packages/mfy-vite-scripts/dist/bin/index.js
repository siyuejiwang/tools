#!/usr/bin/env node
import { spawn } from 'cross-spawn';
import { f as findModulePath } from '../utils/findPath.js';
import 'url';
import 'path';

/**
 * 获取脚本入参
 * e.g: gvite-scripts lib-components --app-packages=src prod
 * args: [ 'lib-components', '--app-packages=src', 'prod' ]
 * @type {string[]}
 */
const args = process.argv.slice(2);

// gw-scripts支持的脚本，如果有新增加的命令，请在此处添加命令名称
const commanders = [
  "develop",
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
      .concat(findModulePath(`../scripts/${script}.js`))
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
  console.log(`not exist script : ${script}`);
  console.log();
  console.log("you can run develop or prod");
}
