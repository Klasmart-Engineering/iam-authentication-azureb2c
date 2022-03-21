import { setupPasswordToggles } from "@common/js/passwordToggle"

const setup = () => {
    setupPasswordToggles()
}

if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    setup()
} else {
    document.addEventListener("DOMContentLoaded", setup, false)
}
