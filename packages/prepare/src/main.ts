import { effect, signal } from 'alien-signals';
import { renderCounter } from './components/Counter';
import { renderLinks } from './components/Header';
import { $ } from './utils/$';

const count = signal(0);

renderCounter({ count });

const links = [
  {
    label: 'counter1',
    path: '/counter1'
  },
  {
    label: 'counter2',
    path: '/counter2'
  }
];

const routes = [
  {
    path: '/counter1',
    component: {
      template: ({ count }) => `<div>count: ${count}</div>`
    }
  },
  {
    path: '/counter2',
    component: {
      template: ({ count }) => `<div>count2: ${count}</div>`
    }
  }
];

window.addEventListener('popstate', (e) => {
  console.log('e => ', e)
})

renderLinks(links);

effect(() => {
  const route = routes.find((route) => route.path === location.pathname);
  $('.router-view')!.innerHTML =
    route?.component.template({
      count: count()
    }) || '';
});
