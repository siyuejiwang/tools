import ArgsParser from "yargs-parser";
export function getArgs(argsOptions = {}) {
  const argsParserOption = {
    configuration: {
      // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
      "short-option-groups": false,
    },
    ...argsOptions,
  };
  return ArgsParser(process.argv, argsParserOption);
}
