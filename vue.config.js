const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    // Xử lý tệp .gltf
    config.module
      .rule("gltf")
      .test(/.(gltf|glb)$/)
      .use("gltf-webpack-loader")
      .loader("gltf-webpack-loader")
      .end();

    // Xử lý tệp .bin
    config.module
      .rule("bin")
      .test(/.bin$/)
      .use("file-loader")
      .loader("file-loader")
      .end();
  },
})
