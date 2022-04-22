import { setupPasswordToggles } from "@js/passwordToggle"
import { setupRedirectOnCancel } from "@js/redirectOnCancel"
import { removeInputPlaceholders } from "@js/removeInputPlaceholders"

const setup = () => {
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
