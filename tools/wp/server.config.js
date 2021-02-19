const path = require('path')

module.exports = {
  target: 'node',
  entry: {
    server: './src/server/index.ts',
  },
  output: {
    path: path.join(__dirname, '../../dist'),
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: './tools/ts/server.json',
            },
          },
        ],
      },
    ],
  },
}