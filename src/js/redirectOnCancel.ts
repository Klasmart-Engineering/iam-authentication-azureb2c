const BUTTON_CANCEL_ID = "cancel"

export const setupRedirectOnCancel = () => {
    const cancelButtonElement = document.getElementById(BUTTON_CANCEL_ID)
    const parentElement = cancelButtonElement?.parentElement
    const urlParams = new URLSearchParams(document.location.search)

    if (!cancelButtonElement) {
        console.warn(`#cancel button not found`)
        return
    }

    const copyElement = cancelButtonElement.cloneNode(true)

    copyElement.addEventListener("click", () => {
        if (
            urlParams
                .get("claimsexchange")
                ?.includes("ForgotPasswordExchangePhone")
        ) {
            history.go(-2)
        } else {
            history.back()
        }
    })

    parentElement?.removeChild(cancelButtonElement)
    parentElement?.appendChild(copyElement)
}
