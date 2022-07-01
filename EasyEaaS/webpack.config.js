const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  stats: {
    warningsFilter: (warning) => {
      // Critical dependency
      // https://github.com/webpack/webpack/issues/1576
      return RegExp('node_modules/express/lib/view.js').test(warning);
    },
  },
};
