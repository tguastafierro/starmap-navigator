const { defineConfig } = require('cypress');
const webpackConfig = require('./webpack.config.js');

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig, // Use the updated config with alias
    },
    specPattern: "cypress/component/**/*.{js,jsx,ts,tsx}",
    supportFile: false,
    indexHtmlFile: "cypress/support/component-index.html",
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    supportFile: false,
  },
});