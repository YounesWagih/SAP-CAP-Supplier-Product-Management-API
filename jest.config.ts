/**
 * Jest configuration for CAP Task
 * TypeScript configuration file
 */
import type { Config } from "jest";

const config: Config = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    collectCoverageFrom: ["srv/**/*.ts", "lib/**/*.ts"],
    coverageDirectory: "coverage",
    verbose: true,
    testTimeout: 10000,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

export default config;
