# README

## FAQ

### What is this repository for?

This repository contains the UI for our user policies in Azure B2C.

### How do I get set up?

-   Install _Azure AD B2C_ VSCode extension
-   Follow [instructions](https://github.com/azure-ad-b2c/vscode-extension/blob/master/src/help/policy-upload.md#configure-your-vs-code-extension) to setup the extension to enable Custom Policy uploads, using the `vscode-extension` application ID

### Contribution guidelines

See [guidelines](#guidelines).

Contribute to [Custom policies](#contribute-to-custom-policies)

### Who do I talk to?

The IAM team

## Guidelines

### Translations

#### B2C

The Lokalise project is called [iam-authentication-azureb2c](https://app.lokalise.com/project/3182637961d6c45679cc44.06370405/)

Any new `<LocalizedString>` or `<LocalizedCollection>` should ideally be created in Lokalise, then downloaded, then run our [updateLocalizationXmlWithNewTranslations](./scripts/updateLocalizationXmlWithNewTranslations.ts) script to convert the JSON file into the B2C XML format.

Note, Lokalise converts nested JSON into a flat key, where each level is separated by `::`.

The JSON structure mimics the `TRUST_FRAMEWORK_LOCALIZATION.xml` hierarchy, which enables us to convert our JSON back into the XML format.

If you want to add new strings to the XML directly, you can add the new entries, then use the [LocalizationXMLtoJSON](./scripts/LocalizationXMLtoJSON.ts) script to convert from XML to JSON, but remember to upload to Lokalise afterwards or your new strings won't get translated!

#### HTML

The Lokalise project is called [iam-authentication-azureb2c (HTML)](https://app.lokalise.com/project/7931918561df16e85482d1.17678014/)

Any changes to the HTML pages should be done on the `en` version of the template.

e.g. for `unified-sign-up-or-sign-in`, modify `unified-sign-up-or-sign-in/en/index.html`

Once your changes are complete, perform the following steps:

##### Repo -> Lokalise

Copy the HTML file to another location, and rename to the name of the page

e.g. rename `index.html` from `pages/forgot-password/en` to `forgot-password.html`

Open the "iam-authentication-azureb2c (HTML)" project, and press the Upload tab

![Upload](./docs/lokalise/upload.png)

NB: on unified-sign-up-or-sign-in, the auto-detected language is not English, so you'll need to manually select that. Additionally, click the filename and remove the _%LANG_ISO%_ placeholder Lokalise tries to insert

![Edit Filename](./docs/lokalise/edit_filename.png)

This will:

1. Add any new strings to Lokalise to be translated
2. Update the HTML on Lokalise for each page

NB: Even if you have made **no changes** to text content of the page, you will still need to do this (OR make the same changes to every language manually)

##### Lokalise -> Repo

First, download the HTML templates from Lokalise with the options below.

![Download](./docs/lokalise/download.png)

Download creates a ZIP file with the following folder structure:

```text
root
├── en
│   ├── change-password.html
│   ├── forgot-password.html
│   ├── local-account-sign-up.html
│   └── unified-sign-up-or-sign-in.html
├── es
│   ├── change-password.html
│   ├── forgot-password.html
│   ├── local-account-sign-up.html
│   └── unified-sign-up-or-sign-in.html
├── ...[other languages]
```

This needs to be converted to the following directory structure:

```text
pages
├── change-password
│   ├── en
│   │   └── index.html
│   ├── es
│   │   └── index.html
│   ├── ...[other languages]
│   ├── index.css
├── forgot-password
│   ├── en
│   ...
├── ...[other pages]
```

First, unzip the folder.

Then, use the [MoveTranslatedHTML](./scripts/MoveTranslatedHTML.ts) script to correct the format, with the folder path (relative or absolute) of the unzipped Lokalise download as the first argument.
e.g. if folder found at "~/Downloads/lokalise", run

```sh
npx ts-node scripts/MoveTranslatedHTML.ts ~/Downloads/lokalise
```

NB: Make sure to run the `sed` command logged to the console once the script finishes

##### Repo -> Lokalise

### Directory structure

All images should go in `assets`

Each B2C policy should have a separate directory in the `src/policies` directory, where the directory name should be the policy name with the `B2C_1_` prefix removed
e.g. "B2C_1_KL_create_user_or_sign_in" becomes "KL_create_user_or_sign_in".

Underneath each policy, each page should have a separate directory, which matches the name in B2C (replacing spaces with `-`).

Each page directory should contain:

-   `index.html`
-   (OPTIONAL) `index.css`
-   (OPTIONAL) `bundle.ts`
-   (OPTIONAL) "languages" directory, with a separate `json` file per language _only_ containing overridden strings

Any common JS/CSS for a particular policy should go in a `common` directory underneath the policy root
e.g. global styling.

### CSS

Any _global_ styling (such as `button` or `input` styling i.e. any generic components) should go in a `global.css` file in the "common/css" subdirectory of a policy.

Any styling specific to a certain design, which is reused across multiple policy pages, should go in the same subdirectory (with a sensible name).

Any styling specific to a page should go in an `index.css` file at the same level as the `index.html` file.

### HTML

HTML templates should use relative links to assets e.g. `./index.css` or `../assets/logo.svg`.

_Note:_ any links to JS should be full path links to Azure storage. See (TODO section)[#js-script-injection-into-html-templates] on why this is necessary.

## Build

HTML/JS/CSS/Assets are built with Webpack to the `dist` directory.

The contents of `dist` should be uploaded to the `klukb2cstorage` Azure storage account, in the `b2ccosmosdb` Blob container.

### Details

#### HTML

`extract-loader` allows using a HTML file as an entrypoint.

`html-loader` creates an index.js file from each index.html file, and prefixes all relative links with the `publicPath` in the Webpack config (which is set to the root of our Azure storage account).
Additionally, it removes comments and minifies the HTML.

`extract-loader` then converts that JS file back into a HTML file.

To remove the temporary `index.js` files built from the source HTML, the Linux `find` utility is used to remove these files after the Webpack build completes.

As `extract-loader` is a slightly older package, it doesn't work with (Asset Modules)[https://webpack.js.org/guides/asset-modules/], so for CSS/images we need to use the older `file-loader` instead.

## TODO

### JS script injection into HTML templates

At the moment, JS links in HTML templates must be full path links to Azure storage.

This is because it doesn't appear possible to use `HTMLWebpackPlugin` and `html-loader`/`extract-loader` sequentially on the same file.

The ideal solution would allow easy local development (injecting a compiled version of the TypeScript bundle into the template with a Webpack dev server), but inject the CDN path in production.

## Contribute to custom policies

-   To ensure you dont override policies which are deployed on SSO or other environments, work on your localy copy, once happy then commit and merge
-   Download Azure AD B2c plugin for VsCode
-   Open [appsettings.json](./src/policies/custom_policies/appsettings.json)
-   Under `Environments` add below snippet and replace `<Initials>` with yours

```
{
    "Name": "SSO-<Initials>",
    "Production": false,
    "Tenant": "kidsloopb2c.onmicrosoft.com",
    "PolicySettings" : {
        "PolicyNamePrefix": "<Initials>_"
    }
}
```

-   Launch VSCode in a new window and open folder `src/policies/custom_policies`
-   `cmd + shift + P` and enter `B2C Policy Build` to build the policy
-   Upload your changed policy:
    -   Automated approach
        -   `cmd + shift + P` and enter `B2C Upload all policies`, or `B2C Upload current policy` after opening the relevant (built) policy file e.g. `src/policies/custom_policies/Environments/SSO-INITIALS/TRUST_FRAMEWORK_LOCALIZATION.xml`
        -   Press the "Login" button on the popup message in the bottom corner of your screen
        -   Paste the contents of your clipboard into the browser window and press the "Next" button
        -   Authenticate if required with your Kidsloop account credentials
    -   Manual approach
        -   In `src/policies/custom_policies/Environments/SSO-<Initials>` you'll find a copy of the policies from `src/policies/custom_policies`
        -   If first time uploading, ensure to upload them in the order of inheritance i.e. Base policy -> extensions -> tenant_config -> localization -> relying_party. Otherwise, simply upload the policy files you've changed
-   Navigate to the `Identity Experience Framework` section on the Azure AD portal
-   Select the `B2C_1A_<INITIALS>_RELYING_PARTY_SIGN_UP_LOG_IN` policy, then press the "Run now" button
    -   If you need to check the JWT payload, then select the `jwt-ms-test` application and `https://jwt.ms` reply url, which will show you the JWT contents on completion of the user flow
-   Once you have verified your changes, merge your changes in policies in `src/policies/custom_policies`
-   Create a PR
-   Once the PR is merged then it is auto deployed to SSO using the bitbucket pipeline (TBA)
