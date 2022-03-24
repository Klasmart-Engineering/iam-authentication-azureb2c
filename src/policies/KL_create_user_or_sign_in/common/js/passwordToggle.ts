const PASSWORD_WITH_TOGGLE_CLASS = "password--with_toggle"
const BASE_CLASS = "password-toggle"
const HIDDEN_CLASS = "password-toggle__hidden"
const VISIBLE_CLASS = "password-toggle__visible"
const WRAPPER_CLASS = "password__container"

export const setupPasswordToggles = () => {
    document
        .querySelectorAll<HTMLInputElement>("input[type=password]")
        .forEach(setupPasswordToggle)
}

const setupPasswordToggle = (passwordInput: HTMLInputElement) => {
    wrapPasswordInput(passwordInput)
    insertPasswordToggle(passwordInput)
}

const wrapPasswordInput = (passwordInput: HTMLInputElement) => {
    const wrapper = document.createElement("div")
    wrapper.classList.add(WRAPPER_CLASS)
    ;(passwordInput.parentElement as HTMLElement).replaceChild(
        wrapper,
        passwordInput
    )
    wrapper.appendChild(passwordInput)
}

const insertPasswordToggle = (passwordInput: HTMLInputElement) => {
    const toggle = document.createElement("button")
    // Avoid form submission onClick
    toggle.setAttribute("type", "button")
    toggle.classList.add(BASE_CLASS, HIDDEN_CLASS)
    toggle.setAttribute("data-testid", "password-toggle")

    passwordInput.classList.add(PASSWORD_WITH_TOGGLE_CLASS)
    passwordInput.insertAdjacentElement("afterend", toggle)

    const togglePasswordVisibility = (event: Event) => {
        // Don't trigger HTML5 pattern validation (`oninvalid` event)
        event.preventDefault()
        event.stopImmediatePropagation()

        if (passwordInput.type === "password") {
            passwordInput.type = "text"
            toggle.classList.add(VISIBLE_CLASS)
            toggle.classList.remove(HIDDEN_CLASS)
        } else {
            passwordInput.type = "password"
            toggle.classList.add(HIDDEN_CLASS)
            toggle.classList.remove(VISIBLE_CLASS)
        }
    }

    toggle.addEventListener("click", togglePasswordVisibility)
    toggle.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key !== "Enter") {
            return
        }
        togglePasswordVisibility(event)
    })
}
