module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github']
      },
      //Necessary for electron to render properly
      chainWebpackRendererProcess(config) {
        config.plugin('define').tap(args => {
          delete args[0]['process.env'].BASE_URL
          return args
        })
      }
    }
  },
  transpileDependencies: [
    'vuetify',
  ],

  configureWebpack: {
    devtool: 'source-map',
  },

  runtimeCompiler: true,
  lintOnSave: false,
};
