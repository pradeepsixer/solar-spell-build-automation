const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    node: {
        fs: 'empty'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            }
        },{
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },{
            test: /\.(png|svg|jpg|gif)$/,
            use: ['file-loader']
        }
      ]
    },
    watchOptions: {
        poll: true
    },
    plugins: [
        new CopyWebpackPlugin([{
                from: '**/*', context: 'html'
            },
            {
                from: 'css/**/*',
            },
            {
                from: 'images/**/*',
            },
        ], {
            context: 'src/'
        })
    ],
    output: {
        filename: 'js/bundle.js',
        path: path.resolve(__dirname, 'static')
    },
};
