// Convert `<LocalizedResources>` XML elements in `TRUST_FRAMEWORK_LOCALIZATION.xml` into a structured JSON format
// which can be uploaded to Lokalize
import { readFile } from "fs/promises"
import path from "path"
import parser from "xml2json"

const LOCALIZATION_XML_PATH = path.resolve(
    "./src/policies/custom_policies/TRUST_FRAMEWORK_LOCALIZATION.xml"
)

interface ClaimTypeSection {
    [elementId: string]: GenericElementSection
}

interface GenericElementSection {
    [stringId: string]: string
}

interface ResourceSection {
    [type: string]: ClaimTypeSection | GenericElementSection
}

interface LocalizedCollectionSection {
    [elementId: string]: {
        [value: string]: string
    }
}

interface Output {
    [resource: string]: ResourceSection
}

interface Data {
    TrustFrameworkPolicy: TrustFrameworkPolicy
}

interface TrustFrameworkPolicy {
    BuildingBlocks: BuildingBlocks
}

interface BuildingBlocks {
    Localization: Localization
}

interface Localization {
    LocalizedResources: LocalizedResource[]
}

interface LocalizedResource {
    Id: string
    LocalizedStrings: LocalizedStrings
    LocalizedCollections?: LocalizedCollections
}

interface LocalizedCollections {
    LocalizedCollection: LocalizedCollection | LocalizedCollection[]
}

interface LocalizedStrings {
    LocalizedString: LocalizedString[]
}

interface LocalizedString {
    ElementType: string
    ElementId?: string | null
    StringId: string
    $t: string
}

interface LocalizedCollection {
    ElementType: string
    ElementId: string
    TargetCollection: string
    Item: Item
}
interface Item {
    Text: string
    Value: string
}

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
                ;(typeSection as ClaimTypeSection)[elementId] = {
                    [id]: value,
                }
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
                    const {
                        ElementId: elementId,
                        Item: { Text: text, Value: value },
                    } = collection

                    if (!(elementId in localizedCollectionSection)) {
                        localizedCollectionSection[elementId] = {}
                    }

                    localizedCollectionSection[elementId][value] = text
                }
            )

            resourceSection["LocalizedCollection"] = localizedCollectionSection
        }

        resources[resourceKey] = resourceSection
    })

    process.stdout.write(JSON.stringify({ custom_policy: resources }))
}

main()
