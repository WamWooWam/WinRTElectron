const webpack = require("webpack")
const path = require('path');

module.exports = {
    entry: './index.ts',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: { allowTsInNodeModules: true }
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
    plugins: [
        new webpack.DllReferencePlugin({
            context: path.dirname(require.resolve("winrt")),
            manifest: require("winrt/dist/manifest.winrt.json")
        }),
    ],
    target: "electron-renderer"
};