import type { LibRouter } from '../lib/router';
import { $ } from '../utils/$';

interface LinkProps {
    links: { label: string; path: string }[];
    router: LibRouter;
}

function renderLinks({ links, router }: LinkProps) {
    const navContainer = $('.nav-container')!;

    const ul = document.createElement('ul');
    const fragment = document.createDocumentFragment();
    links.forEach((link) => {
        const li = document.createElement('li');
        li.setAttribute('data-path', link.path);
        li.textContent = link.label;
        fragment.appendChild(li);
    });
    ul.appendChild(fragment);
    navContainer.appendChild(ul);

    ul.addEventListener('click', (e) => {
        const target = e.target;

        const path = (target as HTMLElement).dataset.path;
        if (path) {
            router.push(path);
        }
    });
}

export { renderLinks };
