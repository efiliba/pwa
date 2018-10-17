const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const {version} = require("./version.json");

const mode = process.env.NODE_ENV || "development";
console.log(`Build mode: ${mode}`);

module.exports = {
  entry: "./src/index.js",
  mode,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: `bundle.js?v=${version}`
  },
  devtool: mode == "development" ? "source-map" : false,
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: "babel-loader"
      }
    }, {
      test: path.resolve(__dirname, "./service-worker.js"),
      use: [{
        loader: "file-loader",
        options: {
            name: "../service-worker.js"
        }
      }, {
        loader: path.resolve(__dirname, "./src/service-worker-version-loader.js"),
        options: {
          version
        }
      }]
    }, {
      test: /\.css$/,
      use: [{
        loader: "style-loader"
      }, {
        loader: "css-loader"
      }]
    }, {
      test: /\.(jpe?g|gif|png|svg)$/,
      loader: "file-loader",
      options: {
          name: "[name].[ext]"
      }
    }]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./public/index.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin([
      {from: "public/images/**", to: "images/icons", flatten: true},
      {from: "public/manifest.json"}
    ])
  ]
};
