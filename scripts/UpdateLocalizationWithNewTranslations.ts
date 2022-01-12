// Convert `<LocalizedResources>` JSON elements with the new translations in src/locale path
//into a structured xml format that is saved to TRUST_FRAMEWORK_LOCALIZATION.xml
import fs from "fs"
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

const UpdateLocalizationWithNewTranslations = (language: any) => {
    let xmlToJsonObject

    fs.readFile(LOCALIZATION_XML_PATH, function (err, buffer) {
        const json = parser.toJson(buffer, { reversible: true })
        const jsonData = fs.readFileSync(`./src/locale/${language}.json`)

        const localizationNewTranslation = JSON.parse(jsonData.toString())

        xmlToJsonObject = JSON.parse(json)
        xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources =
            xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.filter(
                (resource: LocalizedResource) => !resource.Id.endsWith(".en")
            )
        for (const child in localizationNewTranslation.custom_policy) {
            const localizedResource = {} as LocalizedResource
            localizedResource.Id = `api.${child}.${language}`

            for (const secondChild in localizationNewTranslation.custom_policy[
                child
            ]) {
                if (secondChild !== "LocalizedCollection") {
                    for (const thirdChild in localizationNewTranslation
                        .custom_policy[child][secondChild]) {
                        const localizedString = {} as LocalizedString
                        localizedString.ElementType = secondChild
                        const thirdChildObj =
                            localizationNewTranslation.custom_policy[child][
                                secondChild
                            ][thirdChild]
                        if (
                            typeof thirdChildObj === "object" &&
                            thirdChildObj !== null
                        ) {
                            const lastChild = Object.keys(thirdChildObj)
                            localizedString.ElementId = thirdChild
                            localizedString.StringId = lastChild[0]
                            localizedString.$t =
                                localizationNewTranslation.custom_policy[child][
                                    secondChild
                                ][thirdChild][lastChild[0]]
                        } else {
                            localizedString.StringId = thirdChild
                            localizedString.$t =
                                localizationNewTranslation.custom_policy[child][
                                    secondChild
                                ][thirdChild]
                        }

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
                    for (const thirdChild in localizationNewTranslation
                        .custom_policy[child][secondChild]) {
                        const localizedCollection = {} as LocalizedCollection
                        localizedCollection.ElementType = secondChild
                        localizedCollection.ElementId = thirdChild
                        if (!localizedCollection.Item) {
                            localizedCollection.Item = {} as Item
                        }
                        const newTranslationObj =
                            localizationNewTranslation.custom_policy[child][
                                secondChild
                            ][thirdChild]
                        localizedCollection.Item.Value =
                            Object.keys(newTranslationObj)[0]
                        localizedCollection.Item.Text =
                            newTranslationObj[Object.keys(newTranslationObj)[0]]
                        if (!localizedResource.LocalizedCollections) {
                            localizedResource.LocalizedCollections =
                                {} as LocalizedCollections
                        }
                        localizedResource.LocalizedCollections.LocalizedCollection =
                            localizedCollection
                    }
                }
            }

            xmlToJsonObject.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.push(
                localizedResource
            )
        }

        const stringified = JSON.stringify(xmlToJsonObject)
        const xml = parser.toXml(stringified)
        fs.writeFile(LOCALIZATION_XML_PATH, xml, (error: any) => {
            if (error) {
                console.log(error)
            }
        })
    })
}
export default UpdateLocalizationWithNewTranslations
