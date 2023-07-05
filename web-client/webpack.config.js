/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const TerserPlugin = require('terser-webpack-plugin');

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
    runtimeChunk: 'single',
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
        // filename: 'build-[contenthash].js',
        filename: '[name].js',
        path: path.join(__dirname, './build'),
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
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                exclude: /node_modules/,
                use: ['file-loader?name=[name].[ext]'], // ?name=[name].[ext] is only necessary to preserve the original file name
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'svg-url-loader',
                        options: {
                            esModule: false,
                            limit: 10000,
                        },
                    },
                ],
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
            // HtmlWebpackPlugin simplifies creation of HTML files to serve your webpack bundles
            template: './public/index.html',
            filename: './index.html',
            favicon: './public/logo.png',
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
        new WebpackPwaManifest({
            short_name: 'Panther Miner',
            name: 'Panther Miner Client',
            icons: [
                {
                    src: path.resolve('./public/logo.png'),
                    sizes: [64, 32, 24, 16],
                },
                {
                    src: path.resolve('./public/logo.png'),
                    size: '192x192',
                },
                {
                    src: path.resolve('./public/logo.png'),
                    size: '512x512',
                },
            ],
            publicPath: '/',
            theme_color: '#000000',
            background_color: '#ffffff',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
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
