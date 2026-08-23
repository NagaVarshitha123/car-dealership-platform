/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/server.ts',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  clearMocks: true,
};
