/* eslint-disable @typescript-eslint/no-var-requires */
/*eslint-env node*/

const path = require("path")
const glob = require("fast-glob")

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

module.exports = {
    mode: "production",
    entry: buildEntrypoints(),
    context: path.resolve(__dirname, "src"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        publicPath: "https://klukb2cstorage.blob.core.windows.net/b2ccosmosdb/",
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
                    { loader: "html-loader", options: { esModule: false } },
                ],
            },
        ],
    },
}
