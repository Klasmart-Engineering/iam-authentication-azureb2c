// Convert folder structure output from Lokalise "document" project into a nicer format for saving to the repo
import fs from "fs/promises"
import path from "path"
import { exec as execSync } from "child_process"
import util from "util"

const exec = util.promisify(execSync)

const PAGES_FOLDER = "./src/policies/KL_create_user_or_sign_in/pages"

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
                    const destFolder = path.join(PAGES_FOLDER, page, language)
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

    // Unfortunately, can't get this command to do anything at all with `exec`, need to prompt to run the script manually
    console.log(`Translated HTML successfully moved
Please run the following command in the terminal to re-add "DOCTYPE" to each HTML file

sed -i '1 i<!DOCTYPE html>' ${newFilesGlob}`)
}

main()
