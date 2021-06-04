const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry:  {
        winrt: [path.join(__dirname, "index.ts")]
    },
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
    target: "electron-renderer",
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './dist'),
        library: 'winrt'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]',
            entryOnly: false,
            path: path.resolve(__dirname, './dist/manifest.[name].json')
        })
    ]
};