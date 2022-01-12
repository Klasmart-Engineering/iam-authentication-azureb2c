/* eslint-disable @typescript-eslint/no-var-requires */
/*eslint-env node*/

const path = require("path")
const glob = require("fast-glob")
const webpack = require("webpack");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")

const AppSettings = require('./src/policies/custom_policies/appsettings.json');

/**
 * Create separate entrypoint per `index.ts` file in `src` folder, and preserve the folder structure
 * in the `dist` output folder
 *
 * @returns [ { path/to/file/index: src/path/to/file/index.ts } ]
 */
function buildEntrypoints() {
    return Object.fromEntries(
        glob
            .sync("src/**/index.html")
            .concat(glob.sync("src/**/bundle.ts"))
            .map((file) => {
                const pathInfo = path.parse(file)
                // Strip `src` from start of folder path
                const [_, ...relativePath] = pathInfo.dir.split(path.sep)
                return [
                    // e.g. path/to/file/index
                    path.join(...relativePath, pathInfo.name),
                    // e.g. ./<repo_root>/src/path/to/file/index.ts
                    path.resolve(file),
                ]
            })
    )
}

module.exports = ({ environment }) => {
    const { B2CStorage, B2CStroageContainer } = (AppSettings['Environments'].find(({ Name }) => Name === environment) || {})?.PolicySettings || {}
    const DEFAULT_PUBLIC_PATH = "https://klukb2cstorage.blob.core.windows.net/b2ccosmosdb/"
    const PUBLIC_PATH = (B2CStorage && B2CStroageContainer)
                            ? `https://${B2CStorage}.blob.core.windows.net/${B2CStroageContainer}/`
                            : DEFAULT_PUBLIC_PATH
    return {
        mode: "production",
        entry: buildEntrypoints(),
        context: path.resolve(__dirname, "src"),
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            publicPath: PUBLIC_PATH,
            assetModuleFilename: "[name][ext]",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: `babel-loader`,
                    },
                },
                {
                    test: /\.svg$/,
                    use: {
                        // Ideally we would use `type: "asset/resource" here, but it doesn't work with `extract-loader`
                        loader: "file-loader",
                        options: { name: "[path][name].[ext]" },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            // Ideally we would use `type: "asset/resource" here, but it doesn't work with `extract-loader`
                            loader: "file-loader",
                            options: {
                                name: "[path][name].[ext]",
                            },
                        },
                        "extract-loader",
                        {
                            loader: "css-loader",
                            options: {
                                esModule: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.html$/,
                    type: "asset/resource",
                    generator: {
                        filename: "[path][name][ext]",
                    },
                },
                {
                    test: /\.html$/i,
                    use: [
                        "extract-loader",
                        { loader: "html-loader", options: {
                            esModule: false,
                            preprocessor: (content) => {
                                return content.replaceAll(
                                    DEFAULT_PUBLIC_PATH,
                                    PUBLIC_PATH
                                )
                            },
                        },
                    },
                    ],
                },
            ],
        },
        optimization: {
            minimizer: ["...", new CssMinimizerPlugin()],
        },
        plugins: [{
            apply: compiler => {
                compiler.hooks.beforeRun.tap('BeforeRunPlugin', () => {
                    const argument = process.argv.pop();

                    if (argument.includes('--env=environment=')) {
                        const choosenEnvironment = argument.split('=').pop();
                        const availableEnvironments = AppSettings['Environments'].map(({ Name }) => Name);

                        if (availableEnvironments.includes(choosenEnvironment)) {
                            const environment = AppSettings['Environments'].find(({ Name }) => Name === choosenEnvironment)

                            if (!environment?.PolicySettings?.B2CStorage || !environment?.PolicySettings?.B2CStroageContainer) {
                                throw new Error('Storage and container properties do not exists on the choosen environment.');
                            }
                        } else {
                            throw new Error('Choosen environment does not exists.');
                        }
                    } else {
                        throw new Error('Environment argument its not set. Use --env=environment=');
                    }
                })
            }
        }, new webpack.DefinePlugin({
            'process.env': {
                B2CStorage,
                B2CStroageContainer,
            }
        })]
    }
}
