const WHITE_ENV_LIST = ["test", "prod", "preprod", "dev", "beta", /prod-\w+/];

/** 检查 env 是否是合法的env */
function isValidProEnv(inputEnv) {
  return WHITE_ENV_LIST.some((env) => {
    if (typeof env === "string") {
      return inputEnv === env;
    } else {
      return env.test(inputEnv);
    }
  });
}

module.exports = {
  WHITE_ENV_LIST,
  isValidProEnv,
};
