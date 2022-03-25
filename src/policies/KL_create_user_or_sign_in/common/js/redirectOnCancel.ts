const BUTTON_CANCEL_ID = "cancel"

export const setupRedirectOnCancel = () => {
    document
        .getElementById(BUTTON_CANCEL_ID)
        ?.addEventListener("click", (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()

            window.history.back()
        })
}
