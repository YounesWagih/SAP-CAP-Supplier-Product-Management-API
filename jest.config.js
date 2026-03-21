/**
 * Jest configuration for CAP Task
 */
module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    collectCoverageFrom: [
        "srv/**/*.js",
        "lib/**/*.js",
        "!srv/CatalogService.js",
    ],
    coverageDirectory: "coverage",
    verbose: true,
    testTimeout: 10000,
};
