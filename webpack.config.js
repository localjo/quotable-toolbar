const path = require('path');

module.exports = {
  entry: './src/index.ts',
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
  devServer: {
    contentBase: './dist',
  },
  output: {
    filename: 'quotable.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Quotable',
    libraryExport: 'default',
  },
};
