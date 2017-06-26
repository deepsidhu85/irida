module.exports = {
  extends: "google",
  installedESLint: true,
  env: {
    browser: true
  },
  rules: {
    "max-len": [
      "error",
      {
        ignoreStrings: true,
        ignoreComments: true
      }
    ]
  }
};
