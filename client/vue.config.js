const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: [],
  chainWebpack: config => {
    // Remove any plugin whose name contains "progress" (case-insensitive)
    try {
      const pluginNames = Array.from(config.plugins.keys());
      pluginNames.forEach(name => {
        if (typeof name === 'string' && /progress/i.test(name)) {
          config.plugins.delete(name);
        }
      });
    } catch (e) {
      // ignore errors here
    }

    // Extra defensive deletes in case plugin has other names:
    ['progress', 'ProgressPlugin', 'webpackbar', 'progress-bar'].forEach(p => {
      if (config.plugins.has(p)) config.plugins.delete(p);
    });
  }
});