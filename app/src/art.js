// Original editorial cover renderer. Every shape, panel, grade and letter is drawn locally to the export canvas.
const STORIES = {
  sundown: { ink: '#172334', coral: '#ff735b', glow: '#ffbd81', cream: '#fff0d9', dusk: '#543d68', wash: 'rgba(255,89,72,.24)' },
  electric: { ink: '#192133', coral: '#e78dd9', glow: '#8be6ec', cream: '#f6edfa', dusk: '#333d87', wash: 'rgba(138,74,207,.28)' },
  golden: { ink: '#222c34', coral: '#e9ae66', glow: '#f8d7a0', cream: '#fff3dc', dusk: '#647888', wash: 'rgba(192,108,44,.24)' },
};

function rect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function fitText(ctx, text, max, start, family = 'Arial Black, Impact, sans-serif') {
  let size = start;
  do { ctx.font = `900 ${size}px ${family}`; size -= 2; } while (ctx.measureText(text).width > max && size > 24);
  return size + 2;
}
function photoInFrame(ctx, frame, image, placement, tint, center = 0.5, vertical = 0.5) {
  const { x, y, w, h } = frame;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  rect(ctx, x, y, w, h, '#b45d69');
  if (image) {
    const sw = image.naturalWidth || image.width, sh = image.naturalHeight || image.height;
    const scale = Math.max(w / sw, h / sh) * placement.zoom;
    const iw = sw * scale, ih = sh * scale;
    const spareX = Math.max(0, iw - w), spareY = Math.max(0, ih - h);
    ctx.drawImage(image, x - spareX * (center + placement.x / 200), y - spareY * (vertical + placement.y / 200), iw, ih);
  }
  const grade = ctx.createLinearGradient(x, y, x + w * .25, y + h);
  grade.addColorStop(0, 'rgba(29,30,58,.08)'); grade.addColorStop(.55, tint); grade.addColorStop(1, 'rgba(20,17,43,.66)');
  rect(ctx, x, y, w, h, grade);
  ctx.restore();
}
function lightLeaks(ctx, w, h, colors) {
  const haze = ctx.createRadialGradient(w * .78, h * .26, 15, w * .78, h * .26, w * .6);
  haze.addColorStop(0, 'rgba(255,191,126,.26)'); haze.addColorStop(1, 'rgba(255,191,126,0)');
  rect(ctx, 0, 0, w, h, haze);
  ctx.save(); ctx.globalAlpha = .48;
  for (let i = 0; i < 17; i++) {
    const yy = h * (.08 + i * .052);
    rect(ctx, w * .01, yy, w * (.009 + (i % 3) * .003), 2, colors.glow);
  }
  ctx.restore();
}
function titleBlock(ctx, caption, edition, w, h, c) {
  const title = (caption.trim() || 'AFTER HOURS').toUpperCase();
  const words = title.split(/\s+/);
  let lines = [title];
  ctx.font = `900 ${Math.min(166, w * .135)}px Arial Black, Impact, sans-serif`;
  if (words.length > 1 && ctx.measureText(title).width > w * .68) {
    const mid = Math.ceil(words.length / 2); lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  // Two-line title is intentionally stacked like a print cover, not a logo or a game wordmark.
  const maxWidth = w * .88;
  let size = Math.min(166, w * .135, h * (lines.length === 1 ? .17 : .135));
  for (const line of lines) size = Math.min(size, fitText(ctx, line, maxWidth, size));
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.font = `900 ${size}px Arial Black, Impact, sans-serif`;
  const left = w * .065, bottom = h * .875;
  lines.forEach((line, i) => {
    const yy = bottom - (lines.length - 1 - i) * size * .91;
    ctx.shadowColor = 'rgba(11,12,33,.72)'; ctx.shadowBlur = 28;
    ctx.lineWidth = Math.max(7, size * .085); ctx.strokeStyle = c.ink; ctx.strokeText(line, left, yy, maxWidth);
    ctx.shadowBlur = 0; ctx.fillStyle = c.cream; ctx.fillText(line, left, yy, maxWidth);
    ctx.lineWidth = 2; ctx.strokeStyle = c.coral; ctx.strokeText(line, left, yy, maxWidth);
  });
  ctx.restore();
  rect(ctx, w * .067, h * .91, Math.min(w * .15, 150), 4, c.coral);
  ctx.fillStyle = c.cream; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = `700 ${Math.min(21, w * .018)}px Arial, sans-serif`;
  ctx.fillText((edition.trim() || 'THE CITY NEVER SLEEPS').toUpperCase(), w * .067, h * .944, w * .65);
  ctx.textAlign = 'right'; ctx.fillStyle = c.glow; ctx.font = `700 ${Math.min(18, w * .015)}px Arial, sans-serif`;
  ctx.fillText('N / 001', w * .94, h * .944);
}
function coverFrames(w, h, layout) {
  const gutter = Math.max(9, w * .011), top = h * .065, end = h * .745;
  if (layout === 'cinema') return {
    hero: { x: gutter, y: top, w: w * .75 - gutter * 2, h: end - top },
    scene: { x: w * .75, y: top, w: w * .25 - gutter, h: (end - top) * .56 - gutter / 2 },
    detail: { x: w * .75, y: top + (end - top) * .56 + gutter / 2, w: w * .25 - gutter, h: (end - top) * .44 - gutter / 2 },
  };
  if (layout === 'columns') return {
    hero: { x: gutter, y: top, w: w * .51 - gutter * 1.5, h: end - top },
    scene: { x: w * .51 + gutter / 2, y: top, w: w * .245 - gutter, h: end - top },
    detail: { x: w * .755 + gutter / 2, y: top, w: w * .245 - gutter * 1.5, h: end - top },
  };
  return {
    hero: { x: gutter, y: top, w: w * .64 - gutter * 1.5, h: end - top },
    scene: { x: w * .64 + gutter / 2, y: top, w: w * .36 - gutter * 1.5, h: (end - top) * .57 - gutter / 2 },
    detail: { x: w * .64 + gutter / 2, y: top + (end - top) * .57 + gutter / 2, w: w * .36 - gutter * 1.5, h: (end - top) * .43 - gutter / 2 },
  };
}
export function panelAt(canvas, layout, clientX, clientY) {
  const bounds = canvas.getBoundingClientRect(), w = canvas.width * 1200 / canvas.height;
  const x = (clientX - bounds.left) * w / bounds.width, y = (clientY - bounds.top) * 1200 / bounds.height;
  const frames = coverFrames(w, 1200, layout);
  return Object.keys(frames).find(k => { const f = frames[k]; return x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h; }) || null;
}
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d', { alpha: false }), w = canvas.width * 1200 / canvas.height, h = 1200;
  ctx.setTransform(canvas.height / 1200, 0, 0, canvas.height / 1200, 0, 0);
  const c = STORIES[state.palette];
  const sky = ctx.createLinearGradient(0, 0, w * .65, h);
  sky.addColorStop(0, c.ink); sky.addColorStop(.55, c.dusk); sky.addColorStop(1, c.coral);
  rect(ctx, 0, 0, w, h, sky);
  const frames = coverFrames(w, h, state.layout);
  for (const key of ['hero', 'scene', 'detail']) {
    const image = state.photos[key] || state.photos.hero || state.photos.scene || state.photos.detail;
    const topBias = key === 'hero' && w > h * 1.25 ? .06 : key === 'scene' ? .14 : .5;
    photoInFrame(ctx, frames[key], image, state.positions[key], c.wash, key === 'hero' ? .48 : .5, topBias);
  }
  lightLeaks(ctx, w, h, c);
  // The small numerals, angled ticket and hairlines are our editorial frame language.
  ctx.save(); ctx.fillStyle = c.cream; ctx.textAlign = 'left'; ctx.font = `800 ${Math.min(21, w * .018)}px Arial, sans-serif`;
  ctx.textBaseline = 'middle'; ctx.fillText('NIGHTSHIFT     /     A CITY STORY', w * .065, h * .035);
  ctx.textAlign = 'right'; ctx.fillText('VOL. 01    •    AFTER DARK', w * .94, h * .035);
  ctx.restore();
  ctx.save(); ctx.translate(w * .93, h * .69); ctx.rotate(-Math.PI / 2);
  rect(ctx, 0, -22, Math.min(140, h * .13), 38, c.coral);
  ctx.fillStyle = c.ink; ctx.font = '800 17px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EST. AFTER DARK', 70, 3);
  ctx.restore();
  const fade = ctx.createLinearGradient(0, h * .58, 0, h);
  fade.addColorStop(0, 'rgba(18,20,39,0)'); fade.addColorStop(.47, 'rgba(18,20,39,.78)'); fade.addColorStop(1, 'rgba(18,20,39,.94)');
  rect(ctx, 0, h * .58, w, h * .42, fade);
  titleBlock(ctx, state.caption, state.edition, w, h, c);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
