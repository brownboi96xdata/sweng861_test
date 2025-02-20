module.exports = {
  testEnvironment: 'jsdom', // Ensure jsdom is set as the test environment
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  }
};
