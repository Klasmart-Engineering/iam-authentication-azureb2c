// Convert folder structure output from Lokalise "document" project into a nicer format for saving to the repo
import fs from "fs/promises"
import path from "path"
import { exec as execSync } from "child_process"
import util from "util"

const exec = util.promisify(execSync)

const PAGES_FOLDER = "./src/pages"

// In Lokalise you can change the country code on the download page
// However, that setting doesn't persist
// To avoid accidents, it's safer to leave it as is in Lokalise, and fix capitalization here
const LANGUAGE_RENAME_MAP = new Map([["zh-hans", "zh-Hans"]])

const runCommand = async (command: string) => {
    const { stdout, stderr } = await exec(command)
    if (stdout) {
        console.log(stdout)
    }

    if (stderr) {
        throw stderr
    }
}

const fail = (message: string | unknown) => {
    console.error(message)
    process.exitCode = 1
}

const main = async () => {
    const args = process.argv.slice(2)

    if (!args || args[0] === "") {
        return fail("Folder with HTML files not specified")
    }

    const folderPath = args[0]

    try {
        await fs.access(folderPath)
    } catch {
        return fail(`Folder "${folderPath}" not found`)
    }

    const languages = await fs.readdir(folderPath)

    let pages: string[]
    try {
        pages = await fs.readdir(PAGES_FOLDER)
    } catch {
        return fail(`Pages folder "${PAGES_FOLDER}" not found`)
    }

    await Promise.all(
        pages.map(async (page) => {
            await Promise.all(
                languages.map(async (language) => {
                    const sourceFolder = path.join(folderPath, language)
                    const destFolder = path.join(
                        PAGES_FOLDER,
                        page,
                        LANGUAGE_RENAME_MAP.get(language) ?? language
                    )
                    try {
                        await fs.mkdir(destFolder)
                    } catch (error) {
                        // Folder already exists
                    }

                    const sourceFile = path.join(sourceFolder, `${page}.html`)

                    try {
                        await fs.access(sourceFile)
                    } catch {
                        console.error(
                            `Page "${page}" not found for language "${language}"`
                        )
                        return
                    }

                    await fs.copyFile(
                        sourceFile,
                        path.join(destFolder, "index.html")
                    )
                })
            )
        })
    )

    const newFilesGlob = `${PAGES_FOLDER}/**/*.html`

    try {
        await runCommand(`prettier --write "${newFilesGlob}"`)
    } catch (e) {
        return fail(e)
    }
}

main()
