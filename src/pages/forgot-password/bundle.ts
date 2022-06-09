import { setupRedirectOnCancel } from "@js/redirectOnCancel"
import { removeInputPlaceholders } from "@js/removeInputPlaceholders"

const removeContinueButton = () => {
    const element: HTMLElement | null = document.getElementById("continue")

    // eslint-disable-next-line no-var
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "attributes") {
                console.log("attributes changed")
            }
        })
    })

    observer.observe(element as Node, {
        attributes: true, //configure it to listen to attribute changes
    })
}

const setup = () => {
    setupRedirectOnCancel()
    removeInputPlaceholders()
    removeContinueButton()
}

if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
) {
    setup()
} else {
    document.addEventListener("DOMContentLoaded", setup, false)
}
