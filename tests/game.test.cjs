const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/script.js'), 'utf8');

function game(search = '', imagesLoaded = true) {
  const elements = new Map();
  const draws = [];
  const context = new Proxy({}, { get: (_, key) => (...args) => {
    if (key === 'drawImage') draws.push(args);
    if (key === 'getImageData') return { data: new Uint8ClampedArray(4) };
  } });
  const canvas = { getContext: () => context,
    getBoundingClientRect: () => ({ left: 30, top: 40, width: 740, height: 840 }) };
  elements.set('canvas', canvas);
  const requests = [];
  let frames = 0;
  const sandbox = { console: { log() {}, error() {} }, URLSearchParams,
    document: { documentElement: { offsetWidth: 740 }, getElementById(id) {
      if (!elements.has(id)) elements.set(id, {});
      return elements.get(id);
    } }, window: { location: { search } }, Image: class { complete = imagesLoaded; naturalWidth = imagesLoaded ? 100 : 0; },
    XMLHttpRequest: class { open(...args) { requests.push(args); } send() {} },
    requestAnimationFrame() { frames++; } };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return { s: sandbox, canvas, requests, draws, get frames() { return frames; }, click(x, y) {
    canvas.onclick({ clientX: 30 + x * canvas.getBoundingClientRect().width / 740, clientY: 40 + y * canvas.getBoundingClientRect().height / 840,
      offsetX: x * canvas.getBoundingClientRect().width / 740, offsetY: y * canvas.getBoundingClientRect().height / 840 });
  } };
}

test('new game resets selection and stock cursor', () => {
  const { s } = game();
  s.chekCard = 24; s.topCard = 47; s.points = 100; s.bonus = 5;
  s.newGameLoad();
  assert.equal(s.chekCard, 0); assert.equal(s.topCard, 29);
  assert.equal(s.points, 0); assert.equal(s.bonus, 0);
  assert.equal(s.deck.length, 53);
});

test('empty reserve cannot run beyond the deck', () => {
  const g = game();
  for (let i = 29; i <= 52; i++) g.s.deck[i].remov = true;
  g.s.topCard = 53;
  assert.doesNotThrow(() => g.click(40, 100));
  assert.equal(g.s.topCard, 53);
});

test('clicks use current canvas dimensions and position', () => {
  const g = game(); const card = g.s.deck[22]; card.ochko = 13;
  g.canvas.getBoundingClientRect = () => ({ left: 30, top: 40, width: 370, height: 420 });
  g.click(card.x + 20, card.y + 20);
  assert.equal(card.remov, true);
});

test('recycling clears the selected reserve card', () => {
  const g = game(); g.s.topCard = 53; g.s.chekCard = 52;
  g.s.deck[52].cheked = true;
  g.click(40, 100);
  assert.equal(g.s.chekCard, 0);
});

test('a removed card cannot reactivate after reserve recycling', () => {
  const g = game(); g.s.deck[52].remov = true; g.s.topCard = 53;
  g.click(40, 100); g.s.topCard = 53; g.s.changeActiv();
  assert.equal(g.s.deck[52].activ, false);
});

test('winning submits a score once, with encoded identifiers', () => {
  const g = game('?user_id=12&inline_message_id=a%26b');
  g.s.deck[1].remov = true;
  g.click(700, 800); g.click(700, 800);
  assert.equal(g.requests.length, 1);
  assert.match(g.requests[0][1], /inline_message_id=a%26b/);
});

test('ordinary browser play does not submit anonymous results', () => {
  const g = game(); g.s.deck[1].remov = true; g.click(700, 800);
  assert.equal(g.requests.length, 0);
});

test('malformed URL parameters do not stop initialization', () => {
  assert.doesNotThrow(() => game('?user_id=%E0%A4%A'));
});

test('drawing stock reveals only that card, keeping other cards face down', () => {
  const g = game(); g.click(40, 100);
  assert.equal(g.s.topCard, 30);
  assert.equal(g.s.deck[29].card.src, `img/${g.s.deck[29].mast}-${g.s.deck[29].rist}.png`);
  assert.equal(g.s.deck[30].card.src, 'img/Rubashka.png');
  assert.equal(g.s.deck[1].card.src, 'img/Rubashka.png');
});

test('drawing another reserve card clears the previous selection', () => {
  const g = game(); g.s.deck[29].ochko = 2;
  g.click(40, 100); g.click(150, 100);
  assert.equal(g.s.chekCard, 29);
  g.click(40, 100);
  assert.equal(g.s.chekCard, 0);
  assert.equal(g.s.deck[29].activ, false);
  assert.equal(g.s.deck[30].activ, true);
});

test('redraws and new games never start perpetual animation loops', () => {
  const g = game(); g.s.drawCards(); g.s.newGameLoad();
  assert.ok(g.draws.length > 0);
  assert.equal(g.frames, 0);
});

test('every pyramid parent requires both children to be removed', () => {
  for (let row = 1; row <= 6; row++) {
    for (let col = 0; col < row; col++) {
      const g = game(); const parent = row * (row - 1) / 2 + col + 1;
      const child = parent + row;
      g.s.deck[child].remov = true; g.s.changeActiv();
      assert.equal(g.s.deck[parent].activ, false);
      g.s.deck[child + 1].remov = true; g.s.changeActiv();
      assert.equal(g.s.deck[parent].activ, true);
    }
  }
});

test('a pair summing to thirteen removes both cards and scores once', () => {
  const g = game(); g.s.deck[22].ochko = 6; g.s.deck[23].ochko = 7;
  g.click(g.s.deck[22].x + 20, g.s.deck[22].y + 20);
  g.click(g.s.deck[23].x + 20, g.s.deck[23].y + 20);
  assert.equal(g.s.deck[22].remov, true);
  assert.equal(g.s.deck[23].remov, true);
  assert.equal(g.s.points, 1); assert.equal(g.s.bonus, 1);
});

test('sharing outside Telegram is safe', () => {
  const g = game();
  assert.equal(typeof g.s.document.getElementById('share-game').onclick, 'function');
  assert.doesNotThrow(() => g.s.document.getElementById('share-game').onclick());
});

test('victory freezes the final score and remaining cards', () => {
  const g = game(); g.click(40, 100);
  g.s.deck[29].ochko = 13; g.s.deck[1].remov = true;
  const score = g.s.points;
  g.click(150, 100);
  assert.equal(g.s.points, score);
  assert.equal(g.s.deck[29].remov, false);
});

test('image loading redraws the field and cached images are reused', () => {
  const g = game('', false);
  assert.equal(g.draws.length, 0);
  const image = g.s.deck[22].card;
  image.complete = true; image.naturalWidth = 100; image.onload();
  assert.ok(g.draws.some(([drawn]) => drawn === image));
  const back = g.s.deck[1].card;
  g.s.newGameLoad();
  assert.equal(g.s.deck[1].card, back);
});

test('stock can be exhausted, recycled and drawn again', () => {
  const g = game();
  for (let i = 0; i < 24; i++) g.click(40, 100);
  assert.equal(g.s.topCard, 53);
  assert.equal(g.s.deck[52].activ, true);
  g.click(40, 100);
  assert.equal(g.s.topCard, 29);
  assert.equal(g.s.deck[52].activ, false);
  g.click(40, 100);
  assert.equal(g.s.topCard, 30);
  assert.equal(g.s.deck[29].activ, true);
});

test('removal bonus increases and stock drawing reduces it to a minimum of zero', () => {
  const g = game();
  for (const i of [22, 23]) {
    g.s.deck[i].ochko = 13;
    g.click(g.s.deck[i].x + 20, g.s.deck[i].y + 20);
  }
  assert.equal(g.s.points, 3); assert.equal(g.s.bonus, 2);
  for (let i = 0; i < 3; i++) g.click(40, 100);
  assert.equal(g.s.points, 3); assert.equal(g.s.bonus, 0);
});

