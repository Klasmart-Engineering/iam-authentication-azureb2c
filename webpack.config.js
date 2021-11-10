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
        glob.sync("src/**/index.ts").map((file) => {
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
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
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
        ],
    },
}
