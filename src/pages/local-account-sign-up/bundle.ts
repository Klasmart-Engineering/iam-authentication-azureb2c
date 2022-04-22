import DOMPurify from "dompurify"
import { setupPasswordToggles } from "@js/passwordToggle"
import { setupRedirectOnCancel } from "@js/redirectOnCancel"
import { removeInputPlaceholders } from "@js/removeInputPlaceholders"

const PRIVACY_POLICY_ID = "hasAcceptedPrivacyPolicy_true"
const PRIVACY_POLICY_URL = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER}/external/privacy-policy/index.html`
const DEFAULT_PRIVACY_POLICY_TEXT = "I agree to the KidsLoop {{Privacy policy}}"
const PLACEHOLDER_REGEX = /{{(.+)}}/

// Adapted from https://docs.microsoft.com/en-us/azure/active-directory-b2c/javascript-and-page-layout?pivots=b2c-custom-policy#add-terms-of-use
const addPrivacyPolicyLink = () => {
    const label = document.querySelector(
        `#api label[for="${PRIVACY_POLICY_ID}"]`
    )
    if (!label) {
        console.error("Privacy Policy input not found")
        return
    }

    const labelText = label.textContent || DEFAULT_PRIVACY_POLICY_TEXT

    const placeholderMatches = labelText.match(PLACEHOLDER_REGEX)

    const anchor = document.createElement("a")
    anchor.setAttribute("href", PRIVACY_POLICY_URL)
    anchor.setAttribute("data-testid", "privacy_policy-link")
    anchor.setAttribute("target", "_blank")
    anchor.setAttribute("rel", "noopener noreferrer")

    let rawHTML: string
    if (placeholderMatches !== null) {
        // Replace the placeholder with the link
        anchor.textContent = placeholderMatches[1]
        rawHTML = labelText.replace(PLACEHOLDER_REGEX, anchor.outerHTML)
    } else {
        // Make the entire label a link
        anchor.textContent = labelText
        rawHTML = anchor.outerHTML
    }

    // May not strictly be necessary, as we should control the initial text and the link
    // but can't hurt
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
        ALLOWED_ATTR: ["target", "rel", "href"],
    })
    label.innerHTML = cleanHTML
}

const setup = () => {
    addPrivacyPolicyLink()
    setupPasswordToggles()
    setupRedirectOnCancel()
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
