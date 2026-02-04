let ph, tldb = 0;

// DOM元素缓存
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
const ldb = document.getElementById('ldb');
const rootStyle = document.documentElement.style;
const body = document.body;
let w = window.innerWidth, h = window.innerHeight;
canvas.width = w;
canvas.height = h;

// 星空参数
const STAR_DENSITY_K = 0.25;
let STAR_NUM;
const STAR_COLORS = ['rgb(30, 193, 225)', 'rgb(49, 151, 241)', 'rgb(222, 196, 77)', 'rgb(217, 101, 244)'];
const stars = [];
const center = { x: w / 2, y: h / 2 };

// 空间参数，随屏幕自适应
function getFov() {
  return Math.min(w, h) * 1.1;
}
function getStarSize() {
  return Math.sqrt(w*h)/Math.max(w,h)*2;
}
function getWanderRadius() {
  return Math.max(0.8, Math.min(w, h) / 900 * 2.5);
}
const Z_NEAR = 0.2;
const Z_FAR = 1.0;
const Z_RANGE = Z_FAR - Z_NEAR;

// 星星空间分布
function randomStar() {
  const theta = Math.random() * 2 * Math.PI;
  const radius = Math.random() * 0.5 + 0.2;
  const z0 = Math.random() * Z_RANGE + Z_NEAR; // 初始z0
  const size = getStarSize() * (Math.random() * 1.2 + 0.7);
  const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
  const flickerSpeed = Math.random() + 0.7;
  const wanderPhase = Math.random() * Math.PI * 2;
  return {
    theta,
    radius,
    z0,
    size,
    color,
    flickerSpeed,
    flickerPhase: Math.random() * Math.PI * 2,
    wanderPhase,
    wanderSpeed: Math.random() * 0.5 + 0.15,
    wanderRadius: getWanderRadius() * (Math.random() * 1.1 + 0.5)
  };
}

function initStars() {
  stars.length = 0;
  STAR_NUM = Math.floor(Math.max(h, w) * STAR_DENSITY_K - 50);
  for (let i = 0; i < STAR_NUM; i++) {
    stars.push(randomStar());
  }
}

// 动画渲染
function render() {
  const time = performance.now() * 0.002;
  drawStars(time, tldb);
  animationFrameId = requestAnimationFrame(render);
}

// 绘制星星
function drawStars(time, scrollSum) {
  ctx.clearRect(0, 0, w, h);
  // 每像素滚动对应z轴推进
  const zRangePerPx = Z_RANGE / h;

  for (const star of stars) {
    // 环形映射z，保证无论scrollSum多少都能正常分布
    let z = star.z0 + scrollSum * zRangePerPx;
    // 环形流动
    z = ((z - Z_NEAR) % Z_RANGE + Z_RANGE) % Z_RANGE + Z_NEAR;

    // 真实空间投影到屏幕
    const FOV = getFov();
    const planeR = star.radius * FOV;
    const wander = star.wanderRadius * Math.sin(time * star.wanderSpeed + star.wanderPhase);
    const proj = FOV / z;
    const x = center.x + (planeR + wander) * Math.cos(star.theta) * proj / FOV;
    const y = center.y + (planeR + wander) * Math.sin(star.theta) * proj / FOV;

    // 近大远小
    const size = Math.max(0.5, star.size * proj / FOV);

    // 闪烁
    const flicker = 0.7 + 0.3 * Math.sin(time * star.flickerSpeed + star.flickerPhase);

    // 中心淡化区域缩小
    let fade = 1;
    const fadeRadius = Math.min(w, h) * 0.09;
    const distToCenter = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
    if (distToCenter < fadeRadius) {
      fade = Math.max(0, distToCenter / fadeRadius);
    }

    ctx.save();
    ctx.globalAlpha = fade * flicker;
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(size * flicker), 0, 2 * Math.PI);
    ctx.fillStyle = star.color;
    ctx.shadowColor = star.color;
    ctx.shadowBlur = 8 * flicker;
    ctx.fill();
    ctx.restore();
  }
}

render();

// 替换jQuery滚动处理为原生
function scLdb() {
  tldb = ldb.scrollTop;
  if (tldb > ph) {
    if (ldb.classList.contains('sc')) return;
    ldb.classList.add('sc');
    const stsc = ldb.querySelector('.stsc');
    if (stsc) stsc.style.setProperty('--r', '100%');
  } else {
    ldb.classList.remove('sc');
    const stsc = ldb.querySelector('.stsc');
    if (stsc) stsc.style.setProperty('--r', (tldb / ph * 100) + "%");
  }
}

// 替换jQuery body滚动处理为原生
let g_highlight = Array.from(document.querySelectorAll('.highlight,.card'));
let g_percent = Array.from(document.querySelectorAll('.shine'));

function scBody() {
  const t = 0;
  const winH = window.innerHeight;

  for (let i = 0; i < g_highlight.length; i++) {
    const box = g_highlight[i];
    const boxTop = box.getBoundingClientRect().top + t;
    if (t + winH - boxTop > 70) {
      box.classList.add("show");
    } else {
      box.classList.remove("show");
    }
  }

  for (let i = 0; i < g_percent.length; i++) {
    const box = g_percent[i];
    const boxRect = box.getBoundingClientRect();
    const boxTop = boxRect.top + t;
    const boxHeight = box.offsetHeight;
    box.style.setProperty(
      "--scroll",
      `${((winH + t - boxTop) / (winH + boxHeight)) * 100}%`
    );
  }

  if (document.body.scrollTop > ph) {
    if (cloudBg.playing){
      cloudBg.playing=false;
    }
  } else {
    if (!cloudBg.playing){
      cloudBg.playing=true;
      cloudBg._animate();
    }
  }
}

// 初始化
function init() {
  ph = document.body.clientHeight;
  let cird = Math.sqrt(ldb.clientHeight ** 2 + ldb.clientWidth ** 2) + 20;
  rootStyle.setProperty("--ph", `${ph}px`);
  rootStyle.setProperty("--cird", `${cird}px`);
  rootStyle.setProperty("--cirl", `${-(cird - ldb.clientWidth) / 2}px`);
  rootStyle.setProperty("--cirt", `${-(cird - ph) / 2}px`);

  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  center.x = w / 2;
  center.y = h / 2;
  initStars();
}

init();

// 事件监听优化
class CloudBackground {
  constructor(canvasId, bgColor = '#222') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.bgColor = bgColor;
    // 固定參數
    this.cloudRadius = 60;
    this.cloudLines = 7;
    this.colGap = this.cloudRadius * 2.1;
    this.rowGap = this.cloudRadius * 0.9;
    this.strokeColor = 'rgba(180,180,180,0.5)';
    this.cloudFloatX = 0;
    this.cloudFloatY = 10;
    this.cloudFloatSpeed = 0.002;
    this.clouds = [];
    this.playing=true;
    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener('resize', this._resizeHandler);
    this._onResize();
    // this._animate();
  }

  _onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._updateClouds();
  }

  _drawCloud(x, y, r, lines, phase) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r + (lines-1)*6, Math.PI, 0, false);
    ctx.closePath();
    ctx.clip();
    for(let i=0; i<lines; i++) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(180,180,180,0.7)`;
      let rr = r + i*6 + Math.sin(phase + i)*2;
      ctx.arc(x, y, rr, Math.PI, 0, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  _createCloudImage(r, lines) {
    const size = r * 2 + 4;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = offCanvas.height = size;
    const offCtx = offCanvas.getContext('2d');
    for(let i=lines-1; i>=0; i--) {
      let rr = (r/(lines-1)) * i;
      offCtx.save();
      offCtx.beginPath();
      offCtx.arc(size/2, size/2, rr, Math.PI, 0, false);
      offCtx.closePath();
      offCtx.fillStyle = this.bgColor;
      offCtx.fill();
      offCtx.lineWidth = 2;
      offCtx.strokeStyle = this.strokeColor;
      offCtx.stroke();
      offCtx.restore();
    }
    return offCanvas;
  }

  _generateClouds(w, h, r, rowGap, colGap, lines) {
    const clouds = [];
    let rows = Math.ceil(h / (rowGap * 0.5)) + 4;
    let cols = Math.ceil(w / colGap) + 4;
    for(let i=0; i<rows; i++) {
      for(let j=0; j<cols; j++) {
        let offsetX = (i%2) * (colGap/2);
        let x = j*colGap + offsetX;
        let y = h - i*rowGap*0.5;
        let image = this._createCloudImage(r, lines);
        clouds.push({x, y, r, image, row: i, col: j});
      }
    }
    clouds.sort((a, b) => b.row - a.row || a.col - b.col);
    return clouds;
  }

  _updateClouds() {
    this.clouds = this._generateClouds(
      this.canvas.width,
      this.canvas.height,
      this.cloudRadius,
      this.rowGap,
      this.colGap,
      this.cloudLines
    );
  }

  _animate() {
    if(!this.playing) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let t = Date.now() * this.cloudFloatSpeed;
    for(let i=0; i<this.clouds.length; i++) {
      let c = this.clouds[i];
      let phase = t + (c.x + c.y) * 0.002;
      let dx = Math.sin(phase) * this.cloudFloatX;
      let dy = Math.cos(phase*0.7) * this.cloudFloatY;
      let size = c.image.width;
      this.ctx.drawImage(c.image, c.x + dx - size/2, c.y + dy);
    }
    requestAnimationFrame(this._animate.bind(this));
  }

  destroy() {
    window.removeEventListener('resize', this._resizeHandler);
  }
}

let cloudBg= new CloudBackground('cloud-canvas', '#222');

function toggleListener(){
  ldb.removeEventListener("scroll", scLdb);
  body.addEventListener("scroll", scBody);
  // 停止canvas持续的动画
  cancelAnimationFrame(animationFrameId);
  cloudBg._animate();
}
ldb.addEventListener("scroll", scLdb);
// 同时监听window和body的scroll事件，确保兼容所有滚动场景
// window.addEventListener("scroll", scBody);
window.addEventListener("resize", () => {
  init();
  scLdb();
  scBody();
});

// Reset scroll position on #ldb
ldb.scrollTop = 0;

// 主题切换优化
function tgtheme() {
  if (body.classList.contains("light")) {
    body.classList.remove("light");
    cloudBg.bgColor = '#222';
  } else {
    body.classList.add("light");
    cloudBg.bgColor = '#eee';
  }
  cloudBg._updateClouds();
  // 更新云朵背景颜色
}
if (location.search == "?light") {
  tgtheme();
}

// 注释掉自动滚动到顶部，避免影响滚动检测
// window.scrollTo(0, 0);