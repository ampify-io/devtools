const { name } = require('./package');
module.exports = {
  entry: {
    ampify: './src/js/ampify',
    content: './src/js/content',
    background: './src/js/background',
    options: './src/js/options',
  },
  output: {
    path: __dirname + '/dist/js',
    filename: '[name].js',
  },
};
