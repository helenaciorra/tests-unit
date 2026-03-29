/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.js"],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 80,
    },
  },
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js"],
};

module.exports = config;
