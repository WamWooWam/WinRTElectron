const path = require('path');

module.exports = {
    entry: {
        index: {
            import: './index.ts',
            dependOn: 'winrt',
        },
        winrt: 'winrt',
    },
    // mode: 'development',
    // devtool: 'inline-source-map',
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
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    target: "electron-renderer"
};