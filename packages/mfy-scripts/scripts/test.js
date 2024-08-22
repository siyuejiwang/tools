const jest = require('jest');
const path = require("path");

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

let argv = process.argv.slice(2);

function getConfig(resolve) {
  return {
    roots: ['<rootDir>/src'],
    setupFiles: [
      require.resolve('react-app-polyfill/jsdom')
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    testRunner: require.resolve('jest-circus/runner'),
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
      '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': resolve(
        'config/jest_babel.js'
      ),
      '^.+\\.css$': resolve('config/jest_css.js')
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
  }
}

argv.push('--config', JSON.stringify( 
  getConfig( relativePath => path.resolve(__dirname, '..', relativePath) ) 
))

jest.run(argv);