const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')

const env = process.env.NODE_ENV
const isDevelopment = env === 'development'

const baseConfig = {
  entry: {
    client: './src/client/index.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '../../public/assets/js'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: './tools/ts/client.json',
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          'sass-loader'
        ],
      },
    ],
  },
  plugins: [new webpack.EnvironmentPlugin({ NODE_ENV: `${env}` })],
}
const devConfig = merge(baseConfig, {
  devtool: 'source-map',
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
  ]
})
const prdConfig = merge(baseConfig, {})

module.exports = isDevelopment ? devConfig : prdConfig