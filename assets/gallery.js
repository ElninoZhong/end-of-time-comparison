const player = document.querySelector('#player');
const picker = document.querySelector('#edition');
const screen = document.querySelector('#screen');
const direct = document.querySelector('#standalone');
let active = '';

function showEdition(id) {
  const option = Array.from(picker.options).find(item => item.value === id);
  if (!option) return;
  if (!player.open) player.showModal();
  if (active === id) return;
  active = id;
  picker.value = id;
  direct.href = option.dataset.url;
  const frame = document.createElement('iframe');
  frame.title = option.textContent;
  frame.allowFullscreen = true;
  const loading = document.createElement('p');
  loading.className = 'loading';
  loading.setAttribute('role', 'status');
  loading.textContent = '正在加载作品…';
  frame.style.visibility = 'hidden';
  frame.addEventListener('load', () => {
    frame.style.visibility = '';
    loading.remove();
  }, { once: true });
  frame.src = option.dataset.url;
  screen.replaceChildren(loading, frame);
}

if (typeof player.showModal === 'function') {
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-edition]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showEdition(link.dataset.edition);
  });
  picker.addEventListener('change', () => showEdition(picker.value));
  player.querySelector('button').addEventListener('click', () => player.close());
  player.addEventListener('close', () => {
    if (player.open) return;
    screen.replaceChildren();
    active = '';
  });
}
