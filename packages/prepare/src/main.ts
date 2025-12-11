import { effect, signal } from 'alien-signals';
import { renderCounter } from './components/Counter';
import { renderLinks } from './components/Header';
import { createWebHistory, LibRouter } from './lib/router';
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
            template: ({ count }: { count: number }) => `
      <section>
        <h1>this is section 1</h1>
        <div>count2: ${count}</div>
      </section>
      `
        }
    },
    {
        path: '/counter2',
        component: {
            template: ({ count }: { count: number }) => `
      <section>
        <h1>this is section 2</h1>
        <div>count2: ${count}</div>
      </section>
      `
        }
    }
];

// router start
const router = new LibRouter({
    history: createWebHistory(),
    routes
});

router;

renderLinks({ links, router });

// 这里是为了 让count变化时，router-view也变化
effect(() => {
    const route = router.currentRoute;
    console.log('currentRoute => ', route);
    $('.router-view')!.innerHTML = route?.component?.template({ count: count() }) || '';
});
