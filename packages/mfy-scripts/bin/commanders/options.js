const options = [
  {
    name: "--html-template <file>",
    longName: "htmlTemplate",
    description: "specify the HtmlWebpackPlugin template field.",
    defaultValue: "public/index.html",
  },
  {
    name: "--mock",
    longName: "mock",
    description: "specify mock field",
    defaultValue: false,
  },
  {
    name: "--env <string>",
    longName: "env",
    description: "specify env field",
    defaultValue: "dev", // 只用于help的显示
  },
  {
    name: "--micro",
    longName: "micro",
    description: "specify micro field,determine whether started as a micro app", // 是否是以微应用的身份启动
    defaultValue: false,
  },
  {
    name: "--case",
    longName: "case",
    description:
      "specify the case which will be used as a webpack injection variable.(default: goodwe)",
    defaultValue: "goodwe",
  },
  {
    name: "--appcode",
    longName: "appcode",
    description:
      'specify the appcode which will be used as a webpack injection variable.(default:"" )',
    defaultValue: "",
  },
  {
    name: "--fast-refresh",
    longName: "fastRefresh",
    description: "specify whether HMR mode is turned on",
    defaultValue: false,
  },
];

module.exports = { options };
