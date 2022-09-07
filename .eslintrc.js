module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ["jest", "prettier"],
  extends: [
    // use the recommended rule set for both plain javascript and vue
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  rules: {
    "rules": {
      "prettier/prettier": "error"
    }
  }
};
