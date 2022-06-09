const HELP_DESK_CONTAINER_SELECTOR = "#help-container"
const HELP_DESK_VIDEOS = "#help-videos"
const HELP_DESK_SUPPORT_TICKET = "#support-ticket"

const HELP_DESK_VIDEOS_LINK = process.env.HELP_DESK_VIDEOS_LINK
const HELP_DESK_SUPPORT_LINK = process.env.HELP_DESK_SUPPORT_LINK

const checkedQuerySelector = <T extends HTMLElement>(selector: string): T => {
    const el = document.querySelector<T>(selector)
    if (!el) {
        throw new Error(`Selector "${selector}" not found`)
    }
    return el
}

export const showOrHideHelpDesk = () => {
    if (HELP_DESK_VIDEOS_LINK && HELP_DESK_SUPPORT_LINK) {
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
            window.open(HELP_DESK_VIDEOS_LINK, "_blank", "noopener")
        )
        helpDeskSupportTicket?.addEventListener("click", () =>
            window.open(HELP_DESK_SUPPORT_LINK, "_blank", "noopener")
        )
    }
}
