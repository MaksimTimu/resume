// Резюме Максима Тимуша. Чистый JS, без библиотек.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// 1. Имя появляется по буквам
$$('.split').forEach(el => {
  el.innerHTML = [...el.textContent].map((c, i) => `<span class="ch" style="--i:${i}">${c}</span>`).join('');
});

// 2. Печатная машинка
const typed = $('.typed');
if (typed) {
  const words = JSON.parse(typed.dataset.words);
  let w = 0, i = 0, del = false;
  const tick = () => {
    const word = words[w];
    typed.textContent = word.slice(0, i);
    if (!del && i === word.length) { del = true; return setTimeout(tick, 1800); }
    if (del && i === 0) { del = false; w = (w + 1) % words.length; }
    i += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 70);
  };
  reduce ? (typed.textContent = words[0]) : setTimeout(tick, 900);
}

// 3. Появление блоков при прокрутке + счётчики
const countUp = el => {
  const end = +el.dataset.count, suf = el.dataset.suffix || '';
  if (reduce || end === 0) { el.textContent = end + suf; return; }
  const t0 = performance.now(), dur = 1600;
  const step = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.dataset.count !== undefined) countUp(e.target);
    if (e.target.matches('.terminal')) typeCode();
    io.unobserve(e.target);
  });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
$$('.reveal, [data-count]').forEach(el => io.observe(el));
// каскадная задержка внутри сеток
$$('.bento, .projects, .timeline').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--d', i * 0.08 + 's')));

// 4. «Терминал» печатает JSON с подсветкой
const code = [
  ['{', 'p'],
  ['\n  "name": ', 'key'], ['"Максим Тимуш"', 'str'], [',', 'p'],
  ['\n  "age": ', 'key'], ['18', 'num'], [',', 'p'],
  ['\n  "city": ', 'key'], ['"Москва"', 'str'], [',', 'p'],
  ['\n  "role": ', 'key'], ['"Junior Frontend"', 'str'], [',', 'p'],
  ['\n  "stack": ', 'key'], ['[', 'p'], ['"HTML"', 'str'], [', ', 'p'], ['"CSS"', 'str'], [', ', 'p'], ['"JS"', 'str'], [', ', 'p'], ['"React"', 'str'], [', ', 'p'], ['"PHP"', 'str'], [']', 'p'], [',', 'p'],
  ['\n  "ai": ', 'key'], ['[', 'p'], ['"Claude"', 'str'], [', ', 'p'], ['"ChatGPT"', 'str'], [', ', 'p'], ['"Gemini"', 'str'], [']', 'p'], [',', 'p'],
  ['\n  "learning": ', 'key'], ['"TypeScript, Next.js"', 'str'], [',', 'p'],
  ['\n  "openToWork": ', 'key'], ['true', 'num'],
  ['\n}', 'p']
];
let typedOnce = false;
function typeCode() {
  if (typedOnce) return; typedOnce = true;
  const box = $('[data-code]');
  if (reduce) { box.innerHTML = code.map(([t, c]) => `<span class="t-${c}">${t}</span>`).join(''); return; }
  let part = 0, ch = 0, span = null;
  const next = () => {
    if (part >= code.length) return;
    const [text, cls] = code[part];
    if (!span) { span = document.createElement('span'); span.className = 't-' + cls; box.appendChild(span); }
    span.textContent += text[ch++];
    if (ch >= text.length) { part++; ch = 0; span = null; }
    setTimeout(next, text[ch - 1] === '\n' ? 90 : 18);
  };
  next();
}

// 5. Полоса прогресса, тень меню, активный пункт: не чаще одного раза за кадр
const bar = $('.progress'), nav = $('.nav');
const links = $$('.nav__links a');
const sections = $$('main section[id]');
let ticking = false, lastCur = null;
const update = () => {
  ticking = false;
  const h = document.documentElement, y = h.scrollTop;
  bar.style.transform = `scaleX(${y / (h.scrollHeight - h.clientHeight || 1)})`;
  nav.classList.toggle('scrolled', y > 10);
  let cur = '';
  for (const s of sections) if (s.offsetTop - innerHeight * .4 < y) cur = s.id;
  if (cur !== lastCur) {
    lastCur = cur;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
};
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
update();

// 6. PDF, копирование почты, год
const toast = msg => {
  const t = $('.toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2000);
};
$$('[data-print]').forEach(b => b.addEventListener('click', () => {
  $$('.reveal').forEach(el => el.classList.add('in'));
  print();
}));
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); toast('Почта скопирована ✓'); }
  catch { toast(b.dataset.copy); }
}));
$('[data-year]').textContent = new Date().getFullYear();

// Пасхалка для тех, кто открыл консоль
console.log('%cПривет! 👋 Раз вы заглянули в консоль, давайте пообщаемся.', 'font:700 15px sans-serif;color:#fafaf8;background:#111;padding:8px 12px;border-radius:6px');
