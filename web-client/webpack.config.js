/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const targetEnv = process.env.TARGET_ENV;
const isProd = targetEnv === 'production';
const isStaging = targetEnv === 'staging';
const isProdOrStaging = isProd || isStaging;
const babelOptions = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
    ],
    plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        [
            '@simbathesailor/babel-plugin-use-what-changed',
            {
                active: process.env.NODE_ENV !== 'production', // boolean
            },
        ],
    ],
};

const defaultOptimization = {
    splitChunks: {
        cacheGroups: {
            // Move reactjs packages into its own file `vendor-react.js`
            reactVendor: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                name: 'vendor-react',
                chunks: 'all',
            },
        },
    },
};

module.exports = {
    entry: {
        main: ['babel-polyfill', path.resolve(__dirname, './src/index.tsx')],
        // 'miner-worker': './src/services/miner-worker.ts',
    },
    ...(isProdOrStaging
        ? {}
        : {
              devtool: 'source-map', // 'eval-cheap-source-map'
          }),

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
        // @ts-ignore
        plugins: [new TsconfigPathsPlugin({configFile: './tsconfig.json'})],
        // alias: {fs: false},
        // Doesn't work, despite https://webpack.js.org/configuration/resolve/#resolvealiasfields
        // aliasFields: ['browser'],
        fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            os: require.resolve('os-browserify/browser'),
            path: require.resolve('path-browserify'),
            https: require.resolve('https-browserify'),
            http: require.resolve('stream-http'),
            buffer: require.resolve('buffer/'),
            process: require.resolve('process'),
            fs: false,
            readline: false,
        },
    },
    output: {
        clean: true,
        filename: '[name].js',
        path: path.join(__dirname, './build'),
        globalObject: 'self',
        assetModuleFilename: 'assets/[name][ext]',
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.worker\.ts$/i,
                use: [
                    {
                        loader: 'worker-loader',
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                ],
            },
            {
                test: /\.ts|\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: babelOptions,
                    },
                ],
                include: [path.resolve(__dirname, './src')],
                exclude: [
                    path.resolve(__dirname, './build'),
                    path.resolve(__dirname, './node_modules/'),
                ],
            },
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico|webp)$/,
                exclude: /node_modules/,
                type: 'asset/resource',
            },
            {
                test: /\.svg$/i,
                type: 'asset',
                resourceQuery: {not: [/component/]},
            },
            {
                test: /\.svg$/i,
                issuer: /\.[jt]sx?$/,
                resourceQuery: /component/,
                use: ['@svgr/webpack'],
            },
            {
                test: /\.(wasm|zkey)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]' // Keep original filename without hash
                }
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        liveReload: true,
        compress: true,
        port: 3000,
    },
    plugins: [
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: './index.html',
            favicon: './public/logo.png',
            chunks: ['main'],
        }),
        // DefinePlugin allows you to create global constants which can be configured at compile time
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        // For some reason we are using webpack to serve in
        // development mode, bypassing create-react-app's method of
        // supporting environment variables via REACT_APP_* prefix.
        // So use dotenv-webpack instead.
        new Dotenv(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public/circuits.wasm',
                    to: '[name][ext]'
                },
                {
                    from: 'public/provingKey.zkey',
                    to: '[name][ext]'
                }
            ]
        }),
    ],
    optimization: isProdOrStaging
        ? {
              minimize: true,
              minimizer: [new TerserPlugin()],
              ...defaultOptimization,
          }
        : defaultOptimization,
};
