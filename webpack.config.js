const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const {EsbuildPlugin} = require('esbuild-loader');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    stats: {
        modules: false,
    },
    output: {
        filename: '[name].min.js',
        chunkFilename: '[name]-[chunkhash].min.js',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: (module) => {
                        if (!module.hasOwnProperty('resource')) {
                            return false;
                        }

                        return module.resource.includes('node_modules')
                            || module.resource.includes('assets/libraries')
                            || module.resource.includes('libraries');
                    },
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        },
        minimize: true,
        minimizer: [
            new EsbuildPlugin({
                target: 'es2017'
            }),
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new MiniCssExtractPlugin({
            //filename: "[name].bundle.css",
            filename: 'vendor.min.css',
            chunkFilename: 'assets/[id].min.css'
        }),
        new CssoWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'ts',
                    target: 'ES2017'
                }
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: ''
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ],
            },
            {
                test: /\.(ico|gif|png|jpg|jpeg|woff2|woff|ttf|otf|svg|eot)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[hash][ext]'
                }
            }
        ]
    },
};
