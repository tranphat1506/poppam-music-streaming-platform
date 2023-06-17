const path = require("path");
const webpackNodeExternals = require("webpack-node-externals")
module.exports = {
  entry: "./server.js", // Dẫn tới file index.js ta đã tạo
  output: {
    path: path.join(__dirname, "/build"), // Thư mục chứa file được build ra
    filename: "bundle.js",// Tên file được build ra
    publicPath: './dist/',
    clean: true
  },
  target : 'node',
  node : {
    __dirname : false,
    __filename : false
  },
  externals : [webpackNodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/, // Sẽ sử dụng babel-loader cho những file .js
        exclude: /node_modules/, // Loại trừ thư mục node_modules
        use: ["babel-loader"]
      }
    ]
  },
  // Chứa các plugins sẽ cài đặt trong tương lai
  plugins: [
  ]
};