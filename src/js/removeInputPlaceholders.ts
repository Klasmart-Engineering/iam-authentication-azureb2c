export const removeInputPlaceholders = () => {
    document
        .querySelectorAll<HTMLInputElement>("input[placeholder]")
        .forEach(removeInputPlaceholder)
}

const removeInputPlaceholder = (input: HTMLInputElement) => {
    input.placeholder = ``
}
