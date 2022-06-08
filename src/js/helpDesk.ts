const HELP_DESK_CONTAINER_SELECTOR = "#help-container"
const HELP_DESK_VIDEOS = "#help-videos"
const HELP_DESK_SUPPORT_TICKET = "#support-ticket"

const checkedQuerySelector = <T extends HTMLElement>(selector: string): T => {
    const el = document.querySelector<T>(selector)
    if (!el) {
        throw new Error(`Selector "${selector}" not found`)
    }
    return el
}

export const showOrHideHelpDesk = () => {
    console.log(process.env);
    if (process.env.ENABLE_HEPLDESK === 'true') {
        const helpDeskContainer = checkedQuerySelector<HTMLDivElement>(
            HELP_DESK_CONTAINER_SELECTOR
        )
        helpDeskContainer.style.display = "flex"
        const helpDeskVideos =
            checkedQuerySelector<HTMLDivElement>(HELP_DESK_VIDEOS)
        const helpDeskSupportTicket = checkedQuerySelector<HTMLDivElement>(
            HELP_DESK_SUPPORT_TICKET
        )
        helpDeskVideos?.addEventListener("click", () =>
            window.open(process.env.INDIA_HELP_DESK_VIDEOS_LINK, "_blank", "noopener")
        )
        helpDeskSupportTicket?.addEventListener("click", () =>
            window.open(process.env.INDIA_HELP_DESK_SUPPORT_LINK, "_blank", "noopener")
        )
    }
}
