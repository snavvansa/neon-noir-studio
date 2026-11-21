// Nightshift controls: three reframable photo slots and exact-size offline PNG exports.
import { drawCover, panelAt } from './art.js';
const $ = id => document.getElementById(id);
const canvas = $('cover');
const sizes = { square: [1080, 1080], portrait: [1080, 1350], wide: [1920, 1080] };
const state = {
  caption: $('caption').value, edition: $('edition').value, layout: 'triptych', palette: 'sundown', size: 'square', selected: 'hero',
  photos: { hero: null, scene: null, detail: null }, uploadedSlots: new Set(),
  positions: Object.fromEntries(['hero', 'scene', 'detail'].map(slot => [slot, { zoom: 1, x: 0, y: 0 }])),
};
function redraw() { drawCover(canvas, state); }
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Could not load this photo'));
    img.src = url;
  });
}
function selectSlot(slot) {
  state.selected = slot;
  document.querySelectorAll('.slot').forEach(button => button.classList.toggle('selected', button.dataset.slot === slot));
  const pos = state.positions[slot];
  for (const [id, value] of [['zoom', Math.round(pos.zoom * 100)], ['panx', pos.x], ['pany', pos.y]]) {
    $(id).value = value; $(id + '-value').textContent = id === 'zoom' ? value + '%' : String(value);
  }
}
async function setPhoto(slot, url, label) {
  const image = await loadImage(url);
  state.photos[slot] = image;
  $(slot + '-name').textContent = label.toUpperCase();
  redraw();
}
function setSize(size) {
  state.size = size;
  [canvas.width, canvas.height] = sizes[size];
  $('dimensions').textContent = `${canvas.width} × ${canvas.height} PX`;
  document.querySelectorAll('.size').forEach(button => button.classList.toggle('active', button.dataset.size === size));
  redraw();
}
for (const id of ['caption', 'edition']) $(id).addEventListener('input', event => { state[id] = event.target.value; redraw(); });
$('layouts').addEventListener('click', event => {
  const button = event.target.closest('[data-layout]'); if (!button) return;
  state.layout = button.dataset.layout;
  document.querySelectorAll('[data-layout]').forEach(item => item.classList.toggle('active', item === button));
  redraw();
});
$('palettes').addEventListener('click', event => {
  const button = event.target.closest('[data-palette]'); if (!button) return;
  state.palette = button.dataset.palette;
  document.querySelectorAll('[data-palette]').forEach(item => item.classList.toggle('selected', item === button));
  redraw();
});
$('slots').addEventListener('click', event => {
  const button = event.target.closest('[data-slot]'); if (button) selectSlot(button.dataset.slot);
});
$('sizes').addEventListener('click', event => {
  const button = event.target.closest('[data-size]'); if (button) setSize(button.dataset.size);
});
$('photo').addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  if (!file.type.startsWith('image/')) { $('status').textContent = 'Choose a PNG, JPEG or WebP photo.'; return; }
  const url = URL.createObjectURL(file);
  try {
    const firstUpload = state.uploadedSlots.size === 0;
    await setPhoto(state.selected, url, file.name);
    state.uploadedSlots.add(state.selected);
    if (firstUpload) for (const slot of ['hero', 'scene', 'detail']) {
      if (slot !== state.selected) { state.photos[slot] = state.photos[state.selected]; $(slot + '-name').textContent = file.name.toUpperCase(); }
    }
    redraw(); $('status').textContent = firstUpload ? 'Your photo now fills all three frames. Select a frame to replace it.' : 'Photo loaded locally. Adjust the frame or export.';
  }
  catch { $('status').textContent = 'This photo could not be opened. Try another image.'; }
  finally { URL.revokeObjectURL(url); event.target.value = ''; }
});
for (const id of ['zoom', 'panx', 'pany']) $(id).addEventListener('input', event => {
  const value = Number(event.target.value);
  state.positions[state.selected][id === 'zoom' ? 'zoom' : id === 'panx' ? 'x' : 'y'] = id === 'zoom' ? value / 100 : value;
  $(id + '-value').textContent = id === 'zoom' ? value + '%' : String(value);
  redraw();
});
let dragging = null;
canvas.addEventListener('pointerdown', event => {
  const slot = panelAt(canvas, state.layout, event.clientX, event.clientY); if (!slot) return;
  selectSlot(slot); dragging = { x: event.clientX, y: event.clientY, panX: state.positions[slot].x, panY: state.positions[slot].y };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', event => {
  if (!dragging) return;
  const pos = state.positions[state.selected], bounds = canvas.getBoundingClientRect();
  pos.x = Math.max(-100, Math.min(100, Math.round(dragging.panX - (event.clientX - dragging.x) * 155 / bounds.width)));
  pos.y = Math.max(-100, Math.min(100, Math.round(dragging.panY - (event.clientY - dragging.y) * 155 / bounds.height)));
  $('panx').value = pos.x; $('pany').value = pos.y; $('panx-value').textContent = pos.x; $('pany-value').textContent = pos.y;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('pointercancel', () => { dragging = null; });
$('export').addEventListener('click', () => {
  canvas.toBlob(blob => {
    if (!blob) { $('status').textContent = 'Export failed. Please try again.'; return; }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `nightshift-${state.size}-${canvas.width}x${canvas.height}.png`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('status').textContent = `SAVED · ${link.download.toUpperCase()}`;
  }, 'image/png');
});
// Kit-provided image-model sample portraits are loaded by default, so the first open is a working demo.
Promise.all([
  setPhoto('hero', './samples/boulevard.jpg', 'Boulevard sample'),
  setPhoto('scene', './samples/pier.jpg', 'Pier sample'),
  setPhoto('detail', './samples/boulevard.jpg', 'Boulevard sample'),
]).then(() => { document.documentElement.dataset.ready = 'true'; }).catch(error => { $('status').textContent = error.message; });
redraw();
