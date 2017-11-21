const path = require('path')

module.exports = env => ({ 
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname,'dist'),
    filename: 'universal-grid.js',
  },
  module: {
  rules: [
    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
  ]
  }
})
