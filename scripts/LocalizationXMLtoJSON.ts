// Convert `<LocalizedResources>` XML elements in `TRUST_FRAMEWORK_LOCALIZATION.xml` into a structured JSON format
// which can be uploaded to Lokalize
import { readFile } from "fs/promises"
import parser from "xml2json"
import {
    ClaimTypeSection,
    Data,
    GenericElementSection,
    LocalizedCollectionSection,
    Output,
    ResourceSection,
} from "../src/types/translationsTypes"
import { LOCALIZATION_XML_PATH } from "./common"

async function main() {
    const buffer = await readFile(LOCALIZATION_XML_PATH)
    const json = parser.toJson(buffer, { reversible: true })
    const data: Data = JSON.parse(json)

    const resources: Output = {}

    data.TrustFrameworkPolicy.BuildingBlocks.Localization.LocalizedResources.filter(
        (resource) => resource.Id.endsWith(".en")
    ).forEach((resource) => {
        const resourceKey = resource.Id.replace(".en", "").replace("api.", "")
        const resourceSection: ResourceSection = {}
        resource.LocalizedStrings.LocalizedString.forEach((localizedString) => {
            const {
                ElementType: type,
                StringId: id,
                ElementId: elementId,
                $t: value,
            } = localizedString

            if (!(type in resourceSection)) {
                resourceSection[type] = {}
            }

            const typeSection = resourceSection[type]

            if (elementId) {
                if (!(elementId in typeSection)) {
                    typeSection[elementId] = {}
                }
                ;(typeSection as ClaimTypeSection)[elementId][id] = value
            } else {
                ;(typeSection as GenericElementSection)[id] = value
            }
        })

        if (resource.LocalizedCollections) {
            const localizedCollectionSection: LocalizedCollectionSection = {}
            const collections =
                resource.LocalizedCollections.LocalizedCollection
            // xml2json uses a JSON object with a single key for a single Collection, or an Array
            // for multiple collections
            ;(Array.isArray(collections) ? collections : [collections]).forEach(
                (collection) => {
                    const { ElementId: elementId, Item: itemOrItems } =
                        collection

                    if (!(elementId in localizedCollectionSection)) {
                        localizedCollectionSection[elementId] = {}
                    }

                    const items = Array.isArray(itemOrItems)
                        ? itemOrItems
                        : [itemOrItems]

                    items.forEach((item) => {
                        localizedCollectionSection[elementId][item.Value] =
                            item.Text
                    })
                }
            )

            resourceSection["LocalizedCollection"] = localizedCollectionSection
        }

        resources[resourceKey] = resourceSection
    })

    process.stdout.write(JSON.stringify({ custom_policy: resources }))
}

main()
