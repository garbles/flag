module.exports = {
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testRegex: "\\.test\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
  setupFiles: ["<rootDir>/jest.setup.js"]
};
