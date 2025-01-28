// 初始化画布
const bgCanvas = document.getElementById('bgCanvas');
const fireworkCanvas = document.getElementById('fireworkCanvas');
const bgCtx = bgCanvas.getContext('2d');
const fwCtx = fireworkCanvas.getContext('2d');

// 设置画布大小
function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    fireworkCanvas.width = window.innerWidth;
    fireworkCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 星星类
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 2;
        this.brightness = Math.random();
        this.speed = Math.random() * 0.05;
    }

    update() {
        this.brightness += Math.sin(Date.now() * this.speed) * 0.05;
        if (this.brightness < 0) this.brightness = 0;
        if (this.brightness > 1) this.brightness = 1;
    }

    draw() {
        bgCtx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

// 创建星星
const stars = Array(200).fill().map(() => new Star());

// 绘制背景
function drawBackground() {
    const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    gradient.addColorStop(0, '#0e195c');
    gradient.addColorStop(1, '#552456');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });
}

// 修改数字转中文方法
function numberToChinese(num) {
    const units = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
    if (num <= 10) return units[num];
    return units[Math.floor(num/10)] + (num%10 === 0 ? '拾' : '拾' + units[num%10]);
}

// 烟花类
class Firework {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * fireworkCanvas.width;
        this.y = fireworkCanvas.height;
        this.targetY = Math.random() * fireworkCanvas.height * 0.6; // 调整爆炸高度
        this.speed = 4 + Math.random() * 4; // 增加上升速度
        this.particles = [];
        this.hue = Math.random() * 360;
        this.brightness = 50 + Math.random() * 20; // 添加亮度变量
    }

    explode() {
        for (let i = 0; i < 150; i++) { // 增加粒子数量
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 8; // 增加粒子速度范围
            const size = 1 + Math.random() * 2.5; // 添加粒子大小变化
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                alpha: 1,
                color: `hsla(${this.hue}, 100%, ${this.brightness}%` // 使用亮度变量
            });
        }
    }

    update() {
        if (this.y > this.targetY) {
            this.y -= this.speed;
            return true;
        }
        if (!this.particles.length) {
            this.explode();
        }
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // 降低重力影响
            p.alpha -= 0.005; // 降低消散速度
            return p.alpha > 0;
        });
        return this.particles.length > 0;
    }

    draw() {
        if (this.y > this.targetY) {
            fwCtx.fillStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, 3, 0, Math.PI * 2); // 增加上升光点大小
            fwCtx.fill();
        }
        this.particles.forEach(p => {
            fwCtx.fillStyle = `${p.color}, ${p.alpha})`;
            fwCtx.beginPath();
            fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            fwCtx.fill();
        });
    }
}

const fireworks = [];
let isNewYear = false;

// 主循环
function animate() {
    // 清空画布
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    fwCtx.clearRect(0, 0, fireworkCanvas.width, fireworkCanvas.height);

    // 绘制背景和星星
    drawBackground();

    // 更新倒计时
    const now = new Date();
    const newYear = new Date('2025-01-29T00:00:00');
    const diff = newYear - now;

    if (diff > 0) {
        document.getElementById('timer').textContent = formatCountdown(diff);
    } else {
        document.getElementById('timer').textContent = "新年快乐！";
        isNewYear = true;
    }

    // 烟花效果
    if (isNewYear && Math.random() < 0.07) { // 提高烟花出现频率
        fireworks.push(new Firework());
    }

    fireworks.forEach((fw, i) => {
        if (fw.update()) {
            fw.draw();
        } else {
            fireworks.splice(i, 1);
        }
    });

    requestAnimationFrame(animate);
}

function formatCountdown(diff) {
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    if (minutes==0&&hours==0&&days==0&&seconds <= 10) {
        return numberToChinese(seconds);
    }

    let text = '';
    if (days > 0) text += days + "天 ";
    if (days > 0 || hours > 0) text += hours + "时 ";
    if (days > 0 || hours > 0 || minutes > 0) text += minutes + "分 ";
    text += seconds + "秒";
    return text;
}

animate();
