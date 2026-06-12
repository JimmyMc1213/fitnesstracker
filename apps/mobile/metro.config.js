const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.disableHierarchicalLookup = true;
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  "react-native-css-interop": path.resolve(projectRoot, "node_modules/react-native-css-interop"),
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  configPath: path.resolve(projectRoot, "tailwind.config"),
});
