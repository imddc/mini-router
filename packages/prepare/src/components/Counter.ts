import { effect } from "alien-signals";
import { $ } from "../utils/$";

const increaseBtn = $('.increase-btn');
const decreaseBtn = $('.decrease-btn');

function renderCounter({ count }: { count: (v?: number) => number }) {
  effect(() => {
    $('.count-display')!.textContent = `count: ${count()}`;
  });


  increaseBtn?.addEventListener('click', () => {
    count(count() + 1);
  });

  decreaseBtn?.addEventListener('click', () => {
    count(count() - 1);
  });
}

export {
  renderCounter
}

