const LANGUAGE_DROPDOWN_SELECTOR = "#language-select"
const LANGUAGE_PARAM = "ui_locales"

const SIGN_IN_NAME_SELECTOR = "#signInName"
const REDIRECT_TO_SSO_BUTTON_SELECTOR = "#SiginInWithKidsLoopCredentials"
const PASSWORD_LABEL_SELECTOR = ".password-label"
const PASSWORD_INPUT_SELECTOR = "#password"
const SIGN_IN_BUTTON_SELECTOR = "#next"
const CREATE_ACCOUNT_LINKS_SELECTOR = ".claims-provider-list-text-links"
const THROBBER_CONTAINER_SELECTOR = "#throbber"

const checkedQuerySelector = <T extends HTMLElement>(selector: string): T => {
    const el = document.querySelector<T>(selector)
    if (!el) {
        throw new Error(`Selector "${selector}" not found`)
    }
    return el
}

const onChangeLanguage = (e: Event) => {
    const url = new URL(location.href)

    const currentLocale = url.searchParams.get(LANGUAGE_PARAM)
    const newLocale = (e.target as HTMLInputElement).value

    if (currentLocale !== newLocale) {
        url.searchParams.set(LANGUAGE_PARAM, newLocale)
    }

    window.location.replace(url)
}

const setupLanguangeSelect = () => {
    const languageDropdown = checkedQuerySelector<HTMLInputElement>(
        LANGUAGE_DROPDOWN_SELECTOR
    )

    setInitialLanguage(languageDropdown)

    languageDropdown.hidden = false

    languageDropdown.addEventListener("change", onChangeLanguage)
}

const setInitialLanguage = (languageDropdown: HTMLInputElement) => {
    const currentLocale =
        // B2C should set this on the <html> root node
        document.documentElement.lang ||
        new URLSearchParams(location.search).get(LANGUAGE_PARAM)

    if (currentLocale) languageDropdown.value = currentLocale
}

const isKidsloopEmail = (email: string): boolean => {
    const signInNameParts = email.split("@")

    return (
        signInNameParts.length === 2 &&
        signInNameParts[1].toLowerCase() === "kidsloop.live"
    )
}

const redirectToKidsloopSSO = () => {
    const signInNameField = checkedQuerySelector<HTMLInputElement>(
        SIGN_IN_NAME_SELECTOR
    )

    if (!isKidsloopEmail(signInNameField.value)) return

    const redirectToSSOButton = checkedQuerySelector(
        REDIRECT_TO_SSO_BUTTON_SELECTOR
    )
    const passwordLabel = checkedQuerySelector(PASSWORD_LABEL_SELECTOR)
    const passwordInput = checkedQuerySelector(PASSWORD_INPUT_SELECTOR)
    const signInButton = checkedQuerySelector(SIGN_IN_BUTTON_SELECTOR)
    const createAccountLink = checkedQuerySelector(
        CREATE_ACCOUNT_LINKS_SELECTOR
    )
    const throbberContainer = checkedQuerySelector(THROBBER_CONTAINER_SELECTOR)

    const elementsToRemoveForSSOAccounts = [
        passwordLabel,
        passwordInput,
        signInButton,
        createAccountLink,
    ]

    throbberContainer.classList.remove("hidden")
    redirectToSSOButton.click()
    elementsToRemoveForSSOAccounts.forEach((e) => e.remove())
}

const setupKidsloopSSORedirect = () => {
    const signInNameInput = checkedQuerySelector(SIGN_IN_NAME_SELECTOR)
    signInNameInput.addEventListener("blur", redirectToKidsloopSSO)
}

const setup = () => {
    setupLanguangeSelect()
    setupKidsloopSSORedirect()
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    setup()
} else {
    document.addEventListener("DOMContentLoaded", setup, false)
}
