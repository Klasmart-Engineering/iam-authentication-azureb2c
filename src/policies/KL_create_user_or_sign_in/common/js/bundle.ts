const LANGUAGE_DROPDOWN_SELECTOR = "#language-select"
const LANGUAGE_PARAM = "ui_locales"

function getLanguageDropdown(): HTMLInputElement | null {
    const languageDropdown = document.querySelector(LANGUAGE_DROPDOWN_SELECTOR)
    if (!languageDropdown) {
        console.error(
            `languageDropdown with selector ${LANGUAGE_DROPDOWN_SELECTOR} not found`
        )
        return null
    }
    return languageDropdown as HTMLInputElement
}

function onChangeLanguage(e: Event) {
    const url = new URL(location.href)

    const currentLocale = url.searchParams.get(LANGUAGE_PARAM)
    const newLocale = (e.target as HTMLInputElement).value

    if (currentLocale !== newLocale) {
        url.searchParams.set(LANGUAGE_PARAM, newLocale)
    }

    window.location.replace(url)
}

function setupLanguangeSelect() {
    const languageDropdown = getLanguageDropdown()
    if (languageDropdown === null) return

    setInitialLanguage(languageDropdown)

    languageDropdown.hidden = false

    languageDropdown.addEventListener("change", onChangeLanguage)
}

function setInitialLanguage(languageDropdown: HTMLInputElement) {
    const currentLocale =
        // B2C should set this on the <html> root node
        document.documentElement.lang ||
        new URLSearchParams(location.search).get(LANGUAGE_PARAM)

    if (currentLocale) languageDropdown.value = currentLocale
}

if (document.readyState !== "loading") {
    setupLanguangeSelect()
} else {
    document.addEventListener("DOMContentLoaded", setupLanguangeSelect)
}
