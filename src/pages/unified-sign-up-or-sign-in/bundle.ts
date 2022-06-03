import { setupPasswordToggles } from "@js/passwordToggle"
import { removeInputPlaceholders } from "@js/removeInputPlaceholders"

const LANGUAGE_DROPDOWN_SELECTOR = "#language-select"
const LANGUAGE_DROPDOWN_CONTAINER_SELECTOR = "#language-select__container"
const LANGUAGE_PARAM = "ui_locales"

const LOGIN_WITH_PHONE_SELECTOR = "#SigninWithPhone"
const EMAIL_INPUT_SELECTOR = "#signInName"
const PASSWORD_INPUT_SELECTOR = "#password"
const FORGOT_PASSWORD_SELECTOR = "#forgotPassword"

const LOGIN_WITH_EMAIL_SELECTOR = "#SigninWithEmail"
const PHONE_NUMBER_INPUT_SELECTOR = "#signInNamePhoneNumber"
const NATIONAL_NUMBER_INPUT_SELECTOR = "#nationalNumber"

const SIGN_IN_NAME_SELECTOR = "#signInName"
const REDIRECT_TO_SSO_BUTTON_SELECTOR = "#SiginInWithKidsLoopCredentials"
const PASSWORD_LABEL_SELECTOR = ".password-label"
const PASSWORD_CONTAINER_INPUT_SELECTOR = ".password__container"
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

const setupLanguageSelect = () => {
    const languageDropdown = checkedQuerySelector<HTMLInputElement>(
        LANGUAGE_DROPDOWN_SELECTOR
    )

    const languageDropdownContainer = checkedQuerySelector(
        LANGUAGE_DROPDOWN_CONTAINER_SELECTOR
    )

    setInitialLanguage(languageDropdown)

    languageDropdownContainer.style.removeProperty("display")

    languageDropdown.addEventListener("change", onChangeLanguage)
}

const setInitialLanguage = (languageDropdown: HTMLInputElement) => {
    const currentLocale =
        // B2C should set this on the <html> root node
        document.documentElement.lang ||
        new URLSearchParams(location.search).get(LANGUAGE_PARAM)

    if (currentLocale) languageDropdown.value = currentLocale
}

const repositionPhoneLoginLink = () => {
    const phoneLoginLink = checkedQuerySelector<HTMLAnchorElement>(
        LOGIN_WITH_PHONE_SELECTOR
    )

    const emailInput = checkedQuerySelector(EMAIL_INPUT_SELECTOR)

    emailInput.parentElement?.appendChild(phoneLoginLink)
    phoneLoginLink.style.display = "block"
}

const repositionForgotPasswordLink = () => {
    const forgotPasswordLink = checkedQuerySelector<HTMLAnchorElement>(
        FORGOT_PASSWORD_SELECTOR
    )

    const passwordInput = checkedQuerySelector(PASSWORD_INPUT_SELECTOR)

    passwordInput.parentElement?.appendChild(forgotPasswordLink)
    forgotPasswordLink.style.display = "block"
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
    const passwordInput = checkedQuerySelector(
        PASSWORD_CONTAINER_INPUT_SELECTOR
    )
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

const setupUseEmail = () => {
    const emailLoginLink = checkedQuerySelector<HTMLTemplateElement>(
        LOGIN_WITH_EMAIL_SELECTOR
    )

    // Phone number input is different per page in the SigninWithPhone journey
    // 1st Page: Country Code + National Number input
    // 2nd Page: Combined phone number input
    const phoneNumberInput =
        document.querySelector(NATIONAL_NUMBER_INPUT_SELECTOR) ||
        document.querySelector(PHONE_NUMBER_INPUT_SELECTOR)

    if (phoneNumberInput === null) {
        throw new Error(`Phone number input not found`)
    }

    phoneNumberInput.parentElement?.appendChild(emailLoginLink)
    emailLoginLink.style.display = "block"
}

const isEmailLoginPage = (): boolean => {
    return document.querySelector(EMAIL_INPUT_SELECTOR) !== null
}

const isPhoneLoginPage = (): boolean => {
    return document.querySelector(LOGIN_WITH_EMAIL_SELECTOR) !== null
}

const isPhoneLoginWithPasswordPage = (): boolean => {
    return (
        document.querySelector(PHONE_NUMBER_INPUT_SELECTOR) !== null &&
        document.querySelector(PASSWORD_INPUT_SELECTOR) !== null
    )
}

const showForgotPassword = () => {
    const forgotPasswordLink = checkedQuerySelector<HTMLAnchorElement>(
        FORGOT_PASSWORD_SELECTOR
    )

    forgotPasswordLink.style.display = "block"
}

const setup = () => {
    if (isEmailLoginPage()) {
        setupLanguageSelect()
        repositionPhoneLoginLink()
        repositionForgotPasswordLink()
        setupKidsloopSSORedirect()
    }

    if (isPhoneLoginPage() && !isEmailLoginPage()) {
        setupUseEmail()
        repositionForgotPasswordLink()
    }

    if (isPhoneLoginWithPasswordPage()) {
        showForgotPassword()
    }

    setupPasswordToggles()
    removeInputPlaceholders()
}

if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    setup()
} else {
    document.addEventListener("DOMContentLoaded", setup, false)
}
