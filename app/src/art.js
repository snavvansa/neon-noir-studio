// Original editorial cover renderer. Every shape, panel, grade and letter is drawn locally to the export canvas.
const STORIES = {
  sundown: { ink: '#142338', coral: '#ff654f', glow: '#ffb975', cyan: '#64e8e5', cream: '#fff2dc', dusk: '#63336d', wash: 'rgba(255,74,62,.16)' },
  electric: { ink: '#151e41', coral: '#ff69c8', glow: '#c88bff', cyan: '#79f0ec', cream: '#f9e9ff', dusk: '#522d91', wash: 'rgba(165,57,216,.18)' },
  golden: { ink: '#203044', coral: '#f6a14b', glow: '#ffe08d', cyan: '#8ae9dc', cream: '#fff3dc', dusk: '#59758f', wash: 'rgba(219,113,43,.17)' },
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
    ctx.filter = 'saturate(1.28) contrast(1.12)';
    ctx.drawImage(image, x - spareX * (center + placement.x / 200), y - spareY * (vertical + placement.y / 200), iw, ih);
    ctx.filter = 'none';
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
// Vector-only sunset, light trails and palm silhouettes: no borrowed logos, fonts or artwork.
function illustratedNightscape(ctx, w, h, frames, c) {
  ctx.save();
  const sunX = frames.hero.x + frames.hero.w * .15, sunY = h * .54, r = Math.min(h * .11, frames.hero.w * .17);
  const halo = ctx.createRadialGradient(sunX, sunY, r * .28, sunX, sunY, r * 1.9);
  halo.addColorStop(0, 'rgba(255,198,108,.28)'); halo.addColorStop(1, 'rgba(255,198,108,0)');
  rect(ctx, sunX - 2 * r, sunY - 2 * r, 4 * r, 4 * r, halo);
  ctx.strokeStyle = c.glow; ctx.lineWidth = 3; ctx.globalAlpha = .8;
  for (const radius of [r * .76, r, r * 1.18]) {
    ctx.beginPath(); ctx.arc(sunX, sunY, radius, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  }
  for (let i = 0; i < 5; i++) rect(ctx, sunX - r * (1 - i * .16), sunY + i * 12, 2 * r * (1 - i * .16), 3, c.glow);
  ctx.globalAlpha = .95;
  const base = h * .772, step = Math.max(12, w * .022);
  for (let i = 0, x = 0; x < w; i++, x += step) {
    const height = 36 + ((i * 73 + 37) % 95);
    const building = step * (.78 + (i % 3) * .05);
    rect(ctx, x, base - height, building, height, c.ink);
    if (i % 4 === 1) { ctx.fillStyle = c.cyan; ctx.fillRect(x + building * .28, base - height - 9, 2, 9); }
    ctx.globalAlpha = .35;
    for (let floor = 0; floor < 3; floor++) {
      if ((i + floor) % 3 === 0) rect(ctx, x + building * .18, base - height + 11 + floor * 20, 3, 5, c.glow);
    }
    ctx.globalAlpha = .95;
  }
  // Two small palms frame the artificial skyline; never cover the portrait's eyes.
  for (const [px, py, scale] of [[w * .04, h * .69, 1], [w * .96, h * .67, .75]]) {
    ctx.save(); ctx.translate(px, py); ctx.scale(scale, scale);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(0, h * .1); ctx.quadraticCurveTo(12, 8, 0, -54); ctx.stroke();
    ctx.lineWidth = 6;
    for (const sign of [-1, 1]) for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, -52); ctx.quadraticCurveTo(sign * (35 + i * 18), -99 - i * 8, sign * (70 + i * 10), -44 + i * 16); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.globalAlpha = .8; ctx.strokeStyle = c.cyan; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, h * .79); ctx.bezierCurveTo(w * .3, h * .76, w * .48, h * .805, w, h * .77); ctx.stroke();
  ctx.restore();
}
function frameAnnotations(ctx, frames, w, h, c) {
  ctx.save(); ctx.textAlign = 'left'; ctx.font = `800 ${Math.min(17, w * .017)}px Arial, sans-serif`; ctx.textBaseline = 'middle';
  const labels = { hero: '01  /  THE LEAD', scene: '02  /  THE HORIZON', detail: '03  /  THE AFTERIMAGE' };
  for (const [key, frame] of Object.entries(frames)) {
    const x = frame.x + 12, y = frame.y + 13;
    const label = labels[key], badge = Math.min(frame.w - 22, ctx.measureText(label).width + 27);
    rect(ctx, x, y, badge, 30, 'rgba(16,30,45,.82)');
    rect(ctx, x, y, 3, 30, c.cyan);
    ctx.fillStyle = c.cream; ctx.fillText(label, x + 11, y + 15, badge - 15);
  }
  rect(ctx, w * .61, h * .754, w * .35, 2, c.cyan);
  ctx.restore();
}
function microtextStrip(ctx, w, h, c) {
  ctx.save();
  rect(ctx, 0, h * .973, w, h * .027, c.ink);
  rect(ctx, w * .05, h * .974, w * .9, 1, c.cyan);
  ctx.fillStyle = c.cyan; ctx.font = `700 ${Math.min(13, w * .012)}px Arial, sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('NIGHTSHIFT   /   STREETLIGHTS & STORIES   /   001', w * .065, h * .988, w * .72);
  ctx.textAlign = 'right'; ctx.fillStyle = c.glow; ctx.fillText('MADE FOR THE NIGHT  ✦', w * .94, h * .988);
  ctx.restore();
}
function titleBlock(ctx, caption, edition, w, h, c) {
  const title = (caption.trim() || 'AFTER HOURS').toUpperCase();
  const words = title.split(/\s+/);
  let lines = [title];
  ctx.font = `900 ${Math.min(230, w * .17)}px Arial Black, Impact, sans-serif`;
  if (w <= h * 1.25 && words.length > 1 && ctx.measureText(title).width > w * .76) {
    const mid = Math.ceil(words.length / 2); lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  // Two-line title is intentionally stacked like a print cover, not a logo or a game wordmark.
  const maxWidth = w * .87;
  let size = Math.min(230, w * .17, h * (lines.length === 1 ? .2 : .15));
  for (const line of lines) size = Math.min(size, fitText(ctx, line, maxWidth, size));
  ctx.save(); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.font = `900 ${size}px Arial Black, Impact, sans-serif`;
  const left = w * .065, bottom = h * .875;
  lines.forEach((line, i) => {
    const yy = bottom - (lines.length - 1 - i) * size * .91;
    ctx.save();
    // A cyan-to-ink physical extrusion, a thin neon rim, then molten-metal letter faces.
    for (let depth = 12; depth >= 1; depth--) {
      ctx.fillStyle = depth > 7 ? c.ink : c.cyan;
      ctx.globalAlpha = depth > 7 ? .95 : .76;
      ctx.fillText(line, left + depth * 2, yy + depth * 2, maxWidth);
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = c.coral; ctx.shadowBlur = size * .17;
    ctx.lineWidth = Math.max(6, size * .06); ctx.strokeStyle = c.ink; ctx.strokeText(line, left, yy, maxWidth);
    ctx.shadowBlur = 0;
    const metal = ctx.createLinearGradient(0, yy - size, 0, yy + 12);
    metal.addColorStop(0, c.cream); metal.addColorStop(.27, c.glow); metal.addColorStop(.58, c.coral); metal.addColorStop(1, '#c8467d');
    ctx.fillStyle = metal; ctx.fillText(line, left, yy, maxWidth);
    ctx.lineWidth = Math.max(1.5, size * .012); ctx.strokeStyle = c.cream; ctx.strokeText(line, left, yy - 2, maxWidth);
    ctx.restore();
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
  const gutter = Math.max(9, w * .011), top = h * .065, end = h * .805;
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
  illustratedNightscape(ctx, w, h, frames, c);
  frameAnnotations(ctx, frames, w, h, c);
  // A compact original masthead keeps the poster readable at thumbnail scale.
  ctx.save(); ctx.fillStyle = c.cream; ctx.textAlign = 'left'; ctx.font = `800 ${Math.min(21, w * .018)}px Arial, sans-serif`;
  ctx.textBaseline = 'middle'; ctx.fillText('NIGHTSHIFT     /     A CITY STORY', w * .065, h * .035);
  ctx.textAlign = 'right'; ctx.fillText('VOL. 01    •    AFTER DARK', w * .94, h * .035);
  ctx.restore();
  ctx.save(); ctx.translate(w * .93, h * .69); ctx.rotate(-Math.PI / 2);
  rect(ctx, 0, -22, Math.min(140, h * .13), 38, c.coral);
  ctx.fillStyle = c.ink; ctx.font = '800 17px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EST. AFTER DARK', 70, 3);
  ctx.restore();
  const fade = ctx.createLinearGradient(0, h * .58, 0, h);
  fade.addColorStop(0, 'rgba(18,20,39,0)'); fade.addColorStop(.47, 'rgba(18,20,39,.53)'); fade.addColorStop(1, 'rgba(18,20,39,.94)');
  rect(ctx, 0, h * .58, w, h * .42, fade);
  titleBlock(ctx, state.caption, state.edition, w, h, c);
  microtextStrip(ctx, w, h, c);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
