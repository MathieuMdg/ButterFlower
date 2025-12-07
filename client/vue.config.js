const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: [],
  chainWebpack: config => {
    try {
      const pluginNames = Array.from(config.plugins.keys());
      pluginNames.forEach(name => {
        if (typeof name === 'string' && /progress/i.test(name)) {
          config.plugins.delete(name);
        }
      });
    } catch (e) {
    }

    ['progress', 'ProgressPlugin', 'webpackbar', 'progress-bar'].forEach(p => {
      if (config.plugins.has(p)) config.plugins.delete(p);
    });
  }
});