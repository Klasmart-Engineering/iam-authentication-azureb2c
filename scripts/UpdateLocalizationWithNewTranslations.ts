// Convert `<LocalizedResources>` JSON elements with the new translations in src/locale path
//into a structured xml format that is saved to TRUST_FRAMEWORK_LOCALIZATION.xml
import fs from "fs"
import { readFile } from "fs/promises"
import path from "path"
import parser from "xml2json"
import {
    Item,
    LocalizedCollection,
    LocalizedCollections,
    LocalizedResource,
    LocalizedString,
    LocalizedStrings,
} from "../src/types/translationsTypes"
import { LOCALIZATION_XML_PATH } from "./common"

const LOCALE_TRANSLATIONS_PATH = path.resolve("./src/locale")

const UpdateLocalizationWithNewTranslations = async () => {
    const buffer = await readFile(LOCALIZATION_XML_PATH)
    const json = parser.toJson(buffer, { reversible: true })
    const xmlToJsonObject = JSON.parse(json)
    fs.readdirSync(LOCALE_TRANSLATIONS_PATH).forEach((file) => {
        const language =
            file === "zh_CN.json"
                ? "zh-hans"
                : file.substring(0, file.indexOf(".json"))

        const translationFilePath =
            file === "zh_CN.json"
                ? `./src/locale/${file}`
                : `./src/locale/${language}.json`
        const jsonData = fs.readFileSync(translationFilePath)

        const localizationNewTranslation = JSON.parse(jsonData.toString())

        xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources =
            xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.filter(
                (resource: LocalizedResource) => !resource.Id.endsWith(language)
            )
        for (const localizedResourceId in localizationNewTranslation.custom_policy) {
            const localizedResource = {} as LocalizedResource
            localizedResource.Id = `api.${localizedResourceId}.${language}`

            for (const elementType in localizationNewTranslation.custom_policy[
                localizedResourceId
            ]) {
                if (elementType !== "LocalizedCollection") {
                    for (const elementId in localizationNewTranslation
                        .custom_policy[localizedResourceId][elementType]) {
                        const localizedString = getNewLocalizedString(
                            elementType,
                            elementId,
                            localizationNewTranslation.custom_policy[
                                localizedResourceId
                            ][elementType][elementId]
                        )

                        if (!localizedResource.LocalizedStrings) {
                            localizedResource.LocalizedStrings =
                                {} as LocalizedStrings
                            localizedResource.LocalizedStrings.LocalizedString =
                                new Array<LocalizedString>()
                        }
                        localizedResource.LocalizedStrings.LocalizedString.push(
                            localizedString
                        )
                    }
                } else {
                    for (const elementId in localizationNewTranslation
                        .custom_policy[localizedResourceId][elementType]) {
                        const localizedCollection = getNewLocalizedCollection(
                            elementType,
                            elementId,
                            localizationNewTranslation.custom_policy[
                                localizedResourceId
                            ][elementType][elementId]
                        )

                        if (!localizedResource.LocalizedCollections) {
                            localizedResource.LocalizedCollections =
                                {} as LocalizedCollections
                        }
                        if (
                            Array.isArray(
                                localizedResource.LocalizedCollections
                                    .LocalizedCollection
                            )
                        ) {
                            localizedResource.LocalizedCollections.LocalizedCollection.push(
                                localizedCollection
                            )
                        } else {
                            localizedResource.LocalizedCollections.LocalizedCollection =
                                [localizedCollection]
                        }
                    }
                }
            }

            xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.push(
                localizedResource
            )
        }
    })

    const stringified = JSON.stringify(xmlToJsonObject)
    const xml = parser.toXml(stringified)
    fs.writeFile(LOCALIZATION_XML_PATH, xml, (error: any) => {
        if (error) {
            console.log(error)
        }
    })
}

const getNewLocalizedString = (
    elementType: string,
    elementId: string,
    elementIdObj: any
): LocalizedString => {
    const localizedString = {} as LocalizedString
    localizedString.ElementType = elementType
    if (typeof elementIdObj === "object" && elementIdObj !== null) {
        const stringId = Object.keys(elementIdObj)
        localizedString.ElementId = elementId
        localizedString.StringId = stringId[0]
        localizedString.$t = elementIdObj[stringId[0]]
    } else {
        localizedString.StringId = elementId
        localizedString.$t = elementIdObj
    }
    return localizedString
}

const getNewLocalizedCollection = (
    elementType: string,
    elementId: string,
    newTranslationObj: any
): LocalizedCollection => {
    const localizedCollection = {} as LocalizedCollection
    localizedCollection.ElementType = elementType
    localizedCollection.ElementId = elementId
    if (!localizedCollection.Item) {
        localizedCollection.Item = {} as Item[]
    }
    for (const collectionItem in newTranslationObj) {
        const item = {} as Item

        item.Value = collectionItem
        item.Text = newTranslationObj[collectionItem]
        if (!Array.isArray(localizedCollection.Item)) {
            localizedCollection.Item = [item]
        } else {
            localizedCollection.Item.push(item)
        }
    }

    return localizedCollection
}

export default UpdateLocalizationWithNewTranslations
