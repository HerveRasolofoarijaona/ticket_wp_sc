const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Path to your entry file
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'static/js/main.js', // Output filename
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/, // Match .ts and .tsx files
        exclude: /node_modules/, // Exclude node_modules folder
        use: 'babel-loader', // Use babel-loader to transpile TypeScript files
      },
      {
        test: /\.css$/, // Match .css files
        use: ['style-loader', 'css-loader', 'postcss-loader'], // Loaders for CSS
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // File extensions to resolve
    alias: {
      '@': path.resolve(__dirname, 'src'), // Create an alias for the src directory
    },
  },
};
