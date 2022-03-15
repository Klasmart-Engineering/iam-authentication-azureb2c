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

interface ElementIdObj {
    [key: string]: string
}

const updateLocalizationXmlWithNewTranslations = async () => {
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

            const localizedStrings = []
            const localizedCollections = []

            for (const elementType in localizationNewTranslation.custom_policy[
                localizedResourceId
            ]) {
                if (elementType !== "LocalizedCollection") {
                    for (const elementId in localizationNewTranslation
                        .custom_policy[localizedResourceId][elementType]) {
                        localizedStrings.push(
                            // Depending on the elementType, this could be an array of LocalizedStrings (with the same ElementId)
                            // or a single LocalizedString
                            ...buildLocalizedStrings(
                                elementType,
                                elementId,
                                localizationNewTranslation.custom_policy[
                                    localizedResourceId
                                ][elementType][elementId]
                            )
                        )
                    }
                } else {
                    for (const elementId in localizationNewTranslation
                        .custom_policy[localizedResourceId][elementType]) {
                        localizedCollections.push(
                            getNewLocalizedCollection(
                                elementId,
                                localizationNewTranslation.custom_policy[
                                    localizedResourceId
                                ][elementType][elementId]
                            )
                        )
                    }
                }
            }

            // NB: Insertion order is important. B2C upload fails if the LocalizedStrings come
            // before LocalizedCollections
            // Only way to guarantee the output order in a JSON object is to control the input order

            if (localizedCollections.length) {
                if (!localizedResource.LocalizedCollections) {
                    localizedResource.LocalizedCollections =
                        {} as LocalizedCollections
                }
                localizedResource.LocalizedCollections.LocalizedCollection =
                    localizedCollections
            }

            if (localizedStrings.length) {
                if (!localizedResource.LocalizedStrings) {
                    localizedResource.LocalizedStrings = {} as LocalizedStrings
                }
            }

            localizedResource.LocalizedStrings.LocalizedString =
                localizedStrings

            xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.push(
                localizedResource
            )
        }
    })

    const stringified = JSON.stringify(xmlToJsonObject)
    const xml = parser.toXml(stringified)
    fs.writeFile(LOCALIZATION_XML_PATH, xml, (error) => {
        if (error) {
            console.log(error)
        }
    })
}

/**
 * For some element types e.g. `ClaimType` or `DisplayControl`, we expect multiple StringIds
 * associated with the same ElementId (a nested object)
 * For other element types, we expect just a string
 */
const buildLocalizedStrings = (
    elementType: string,
    elementOrStringId: string,
    textOrElementIdObject: ElementIdObj | string
): LocalizedString[] => {
    if (typeof textOrElementIdObject === "string") {
        return [
            {
                ElementType: elementType,
                StringId: elementOrStringId,
                $t: textOrElementIdObject,
            },
        ]
    }

    return Object.entries(textOrElementIdObject).map(([StringId, $t]) => {
        return {
            ElementType: elementType,
            ElementId: elementOrStringId,
            StringId,
            $t,
        }
    })
}

const getNewLocalizedCollection = (
    elementId: string,
    newTranslationObj: ElementIdObj
): LocalizedCollection => {
    const localizedCollection = {} as LocalizedCollection
    // ElementType is always "ClaimType" for our use cases
    localizedCollection.ElementType = "ClaimType"
    localizedCollection.ElementId = elementId
    // This attribute seems to be required, and is always "Restriction" for our use cases
    localizedCollection.TargetCollection = "Restriction"
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

updateLocalizationXmlWithNewTranslations()
