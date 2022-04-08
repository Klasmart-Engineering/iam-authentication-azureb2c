const BUTTON_CANCEL_ID = "cancel"

export const setupRedirectOnCancel = () => {
    const cancelButtonElement = document.getElementById(BUTTON_CANCEL_ID)
    const parentElement = cancelButtonElement?.parentElement

    if (!cancelButtonElement) {
        console.warn(`#cancel button not found`)
        return
    }
    
    const copyElement = cancelButtonElement.cloneNode(true)

    copyElement.addEventListener("click", () => {
        history.back()
    })

    parentElement?.removeChild(cancelButtonElement)
    parentElement?.appendChild(copyElement)
}
