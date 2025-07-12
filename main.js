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
const STAR_DENSITY = 0.00035;
let STAR_NUM = Math.floor(w * h * STAR_DENSITY);
const STAR_COLORS = ['rgb(30, 193, 225)', 'rgb(49, 151, 241)', 'rgb(222, 196, 77)', 'rgb(217, 101, 244)'];
const stars = [];
const center = { x: w / 2, y: h / 2 };

// 空间参数，随屏幕自适应
function getFov() {
  return Math.min(w, h) * 1.1;
}
function getStarSize() {
  return Math.max(1.2, Math.min(w, h) / 900 * 2.2);
}
function getWanderRadius() {
  return Math.max(0.8, Math.min(w, h) / 900 * 2.5);
}
function getFlickerSpeed() {
  return Math.max(0.5, Math.min(w, h) / 900 * 1.2);
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
  const flickerSpeed = getFlickerSpeed() * (Math.random() * 1.2 + 0.7);
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
  STAR_NUM = Math.floor(w * h * STAR_DENSITY);
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
let g_highlight = Array.from(document.querySelectorAll('.highlight'));
let g_percent = Array.from(document.querySelectorAll('.shine'));

function scBody() {
  let t = window.scrollY || window.pageYOffset;
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
}

// 初始化
function init() {
  ph = ldb.clientHeight;
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

function toggleListener(){
  ldb.removeEventListener("scroll", scLdb);
  body.addEventListener("scroll", scBody);
  // 停止canvas持续的动画
  cancelAnimationFrame(animationFrameId);

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
  } else {
    body.classList.add("light");
  }
}
if (location.search == "?light") {
  tgtheme();
}

// 注释掉自动滚动到顶部，避免影响滚动检测
// window.scrollTo(0, 0);