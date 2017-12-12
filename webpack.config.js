const path = require('path')

module.exports = env => ({ 
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname,'dist'),
    filename: 'integ-grid-tools.js',
  },
  externals: [
    "data.maybe",
    "fbjs",
    "ramda",
    "react",
    "react-dom",
    "styled-components"
  ],
  module: {
  rules: [
    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
  ]
  }
})
