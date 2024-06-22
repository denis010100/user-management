module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', 
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  presets: ["next/babel"]
};
