const path = require('path');

module.exports = [
{
    entry: "./src/pack.js",
    mode: "development",
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'shim.js',
        path: path.resolve(__dirname, 'dist'),
    },
    target: "electron-renderer",
    node: {
        global: true            
    }
}];