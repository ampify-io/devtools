const { name } = require('./package');

module.exports = {
  entry: {
    [name]: './src'
  },
  output: {
    library: '[name]',
    libraryTarget: 'window',
    filename: '[name].js'
  }
};