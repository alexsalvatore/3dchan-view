const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/test.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 3000,
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./template/index.html",
      title: "3D Chan test page",
      filename: "index.html",
      inject: "body"
    }
    )
  ]
}