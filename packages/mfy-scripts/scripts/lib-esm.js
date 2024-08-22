const rollup = require('rollup');

const rollupESConfig = require('../config/rollup.es.config');

const inputOptions = {
  input: rollupESConfig.input,
  external: rollupESConfig.external,
  plugins: rollupESConfig.plugins
}
const outputOptions = rollupESConfig.output;

async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // generate code and a sourcemap
  const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

build().then(() => {
  console.log("build library esm successfully");
}).catch((err) => {
  console.log("build library esm error",err);
});
