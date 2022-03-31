import { setupRedirectOnCancel } from "@js/redirectOnCancel"

const setup = () => {
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
