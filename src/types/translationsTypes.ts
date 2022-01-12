export interface ClaimTypeSection {
    [elementId: string]: GenericElementSection
}

export interface GenericElementSection {
    [stringId: string]: string
}

export interface ResourceSection {
    [type: string]: ClaimTypeSection | GenericElementSection
}

export interface LocalizedCollectionSection {
    [elementId: string]: {
        [value: string]: string
    }
}

export interface Output {
    [resource: string]: ResourceSection
}

export interface Data {
    TrustFrameworkPolicy: TrustFrameworkPolicy
}

export interface TrustFrameworkPolicy {
    BuildingBlocks: BuildingBlocks
}

export interface BuildingBlocks {
    Localization: Localization
}

export interface Localization {
    LocalizedResources: LocalizedResource[]
}

export interface LocalizedResource {
    Id: string
    LocalizedStrings: LocalizedStrings
    LocalizedCollections?: LocalizedCollections
}

export interface LocalizedCollections {
    LocalizedCollection: LocalizedCollection | LocalizedCollection[]
}

export interface LocalizedStrings {
    LocalizedString: LocalizedString[]
}

export interface LocalizedString {
    ElementType: string
    ElementId?: string | null
    StringId: string
    $t: string
}

export interface LocalizedCollection {
    ElementType: string
    ElementId: string
    TargetCollection: string
    Item: Item | Item[]
}
export interface Item {
    Text: string
    Value: string
}