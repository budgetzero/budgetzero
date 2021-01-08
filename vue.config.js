const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
const webpack = require('webpack');

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
    plugins: [
      new webpack.DefinePlugin({
          'process.env': {
              PACKAGE_VERSION: '"' + version + '"'
          }
      })
  ]
  },

  runtimeCompiler: true,
  lintOnSave: false,
};
