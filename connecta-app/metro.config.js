const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('tsx', 'ts', 'js', 'jsx', 'json');

module.exports = config;
