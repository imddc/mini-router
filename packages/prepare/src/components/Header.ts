import { $ } from "../utils/$";

function renderLinks(links: { label: string; path: string }[]) {
  const navContainer = $('.nav-container')!

  const ul = document.createElement('ul')
  const fragment = document.createDocumentFragment()
  links.forEach((link) => {
    const li = document.createElement('li')
    li.setAttribute('data-path', link.path)
    li.textContent = link.label
    fragment.appendChild(li)
  })
  ul.appendChild(fragment)
  navContainer.appendChild(ul)

  ul.addEventListener('click', e => {
    const target = e.target

    const path = (target as HTMLElement).dataset.path
    if (path) {
      window.history.pushState(null, '', path)
    }
  })
}

export {
  renderLinks,
}
