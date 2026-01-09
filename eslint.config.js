import vue from "eslint-plugin-vue";

export default [
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    plugins: { vue },
    rules: {
      "vue/multi-word-component-names": "off"
    }
  }
];
