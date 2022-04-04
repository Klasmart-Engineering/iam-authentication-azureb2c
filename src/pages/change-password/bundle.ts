import { setupPasswordToggles } from "@js/passwordToggle"
import { setupRedirectOnCancel } from "@js/redirectOnCancel"

const setup = () => {
    setupPasswordToggles()
    setupRedirectOnCancel()
}

if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    setup()
} else {
    document.addEventListener("DOMContentLoaded", setup, false)
}
