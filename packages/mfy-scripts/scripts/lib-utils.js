const spawn = require("cross-spawn");
const { getSuffixArgs } = require("@gw/gw-helpers/dev");
const commander = require("../bin/commanders/lib-utils");
commander();

const suffixArgs = getSuffixArgs(process.argv, "lib-utils");

const buildUmd = () => {
  spawn.sync(process.execPath, [require.resolve("./lib-umd.js"), suffixArgs], {
    stdio: "inherit",
  });
};

const buildEsm = () => {
  spawn.sync(process.execPath, [require.resolve("./lib-esm.js"), suffixArgs], {
    stdio: "inherit",
  });
};

function run() {
  buildUmd();
  buildEsm();
}

run();
