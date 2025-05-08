let score = 0;
let timeLeft = 30;
let totalTime = 30;
let timerInterval;
let speedFactor = 1;
let speedIncreaseInterval;
let infiniteMode = false;

// DOM 元素
const setupPanel = document.getElementById('setupPanel');
const gameArea = document.getElementById('gameArea');
const endPanel = document.getElementById('endPanel');

const imageContainer = document.getElementById('imageContainer');
const scoreBoard = document.getElementById('scoreBoard');
const timerDisplay = document.getElementById('timer');
const finalScore = document.getElementById('finalScore');
const usedTimeDisplay = document.getElementById('usedTime');
const rankDisplay = document.getElementById('rank');
const highScoreDisplay = document.getElementById('highScoreDisplay');

const timeSelect = document.getElementById('timeSelect');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const endGameBtn = document.getElementById('endGameBtn');
const finishGameBtn = document.getElementById('finishGameBtn');
const infiniteModeCheckbox = document.getElementById('infiniteMode');
const speedInput = document.getElementById('speedInput');
const speedSetting = document.getElementById('speedSetting');

const bgMusic = document.getElementById('bgMusic');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');

// 图片资源库
const imageLibrary = [
    "images/mao1.gif",
    "images/mao2.gif",
    "images/mao3.gif",
    "images/mao4.gif",
    "images/mao5.gif",
    "images/mao6.gif",
    "images/mao7.gif"
];

// 获取历史最高分
function getHighScore() {
    return parseInt(localStorage.getItem('clickGameHighScore')) || 0;
}

// 设置历史最高分
function setHighScore(score) {
    localStorage.setItem('clickGameHighScore', score);
}

// 更新历史最高分显示
function updateHighScoreDisplay() {
    const highScore = getHighScore();
    if (highScore > 0) {
        highScoreDisplay.textContent = `历史最高分：${highScore}`;
    } else {
        highScoreDisplay.textContent = '';
    }
}

// 随机生成图片位置与速度
function moveImage(img) {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    const randomX = Math.random() * (areaWidth - 60);
    const randomY = Math.random() * (areaHeight - 60);

    img.style.left = `${randomX}px`;
    img.style.top = `${randomY}px`;
    img.style.display = 'block';
    img.src = imageLibrary[Math.floor(Math.random() * imageLibrary.length)];

    img.speedX = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5) * speedFactor;
    img.speedY = (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 1 + 0.5) * speedFactor;
}

// 动画更新函数
function animateImages() {
    const images = document.querySelectorAll('.clickImage');
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    images.forEach(img => {
        if (img.style.display === 'none') return;

        let x = parseFloat(img.style.left);
        let y = parseFloat(img.style.top);

        x += img.speedX;
        y += img.speedY;

        // 边界判断 & 超出后隐藏并重新出现
        if (x < -60 || x > areaWidth || y < -60 || y > areaHeight) {
            img.style.display = 'none';
            setTimeout(() => {
                moveImage(img);
            }, Math.random() * 1000);
        } else {
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
        }
    });

    requestAnimationFrame(animateImages);
}

// 创建单个图片元素
function createImage() {
    const img = document.createElement('img');
    img.classList.add('clickImage', 'clickFeedback');
    img.style.display = 'none';
    imageContainer.appendChild(img);

    moveImage(img);

    // 点击事件处理
    img.addEventListener('click', () => {
        score++;
        scoreBoard.textContent = `抓住了：${score}只`;

        img.classList.add('clickFeedback');
        img.style.display = 'none';

        setTimeout(() => {
            moveImage(img);
            img.classList.remove('clickFeedback');
        }, Math.random() * 1000);
    });
}

// 开始游戏逻辑
function startGame() {
    score = 0;
    timeLeft = parseInt(timeSelect.value);
    totalTime = timeLeft;
    infiniteMode = infiniteModeCheckbox.checked;
    speedFactor = parseFloat(speedInput.value) || 1;

    scoreBoard.textContent = `抓住了：0只`;

    // 根据模式切换 UI 显示
    if (infiniteMode) {
        timerDisplay.style.display = 'none';
        speedSetting.style.display = 'block';
        finishGameBtn.style.display = 'inline-block'; // 显示结算按钮
    } else {
        timerDisplay.style.display = 'block';
        speedSetting.style.display = 'none';
        timerDisplay.textContent = `剩余时间：${timeLeft}s`;
        finishGameBtn.style.display = 'none'; // 隐藏结算按钮
    }

    // 初始化面板状态
    endPanel.style.display = 'none';
    gameArea.style.display = 'block';
    imageContainer.innerHTML = '';

    // 创建初始图片
    for (let i = 0; i < 5; i++) {
        createImage();
    }

    animateImages();

    // 增加难度：每 6 秒提升一次速度
    clearInterval(speedIncreaseInterval);
    speedIncreaseInterval = setInterval(() => {
        speedFactor += 0.5;
    }, 6000);

    // 倒计时逻辑
    clearInterval(timerInterval);
    if (!infiniteMode) {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `剩余时间：${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }
}

// 结束游戏逻辑
function endGame() {
    const images = document.querySelectorAll('.clickImage');
    images.forEach(img => img.remove());

    let bgImage = '';
    let rankText = '';

    // 统一结算面板内容
    finalScore.textContent = `抓住了：${score}只`;

    // 使用时间计算
    let timeUsedText = '未知';
    if (infiniteMode && typeof gameStartTime !== 'undefined') {
        const timeUsed = Math.floor((Date.now() - gameStartTime) / 1000);
        timeUsedText = `${timeUsed} 秒`;
    } else {
        timeUsedText = `${totalTime} 秒`;
    }
    usedTimeDisplay.textContent = `使用时间：${timeUsedText}`;

    // 等级判定
    if (score <= 10) {
        rankText = '🧍 人棍';
        bgImage = 'url(images/frist.gif)';
    } else if (score <= 30) {
        rankText = '🧑 中人';
        bgImage = 'url(images/second.gif)';
    } else if (score <= 60) {
        rankText = '🧑‍🦰 人';
        bgImage = 'url(images/mao8.gif)';
    } else {
        rankText = '🧠 神';
        bgImage = 'url(images/mao9.gif)';
    }

    rankDisplay.textContent = `评级：${rankText}`;

    // 高分处理
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
        setHighScore(score);
        highScoreDisplay.textContent = `🎉 新纪录：${score}`;
    } else {
        highScoreDisplay.textContent = `历史最高分：${currentHighScore}`;
    }

    // 结算面板样式设置
    endPanel.style.backgroundImage = bgImage;
    endPanel.style.backgroundSize = 'cover';
    endPanel.style.backgroundPosition = 'center';
    endPanel.style.color = '#fff';
    endPanel.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
    endPanel.style.display = 'block';
    gameArea.style.display = 'none';
}

// 按钮绑定事件
startBtn.addEventListener('click', () => {
    setupPanel.style.display = 'none';
    gameArea.style.display = 'block';
    startGame();
});

restartBtn.addEventListener('click', () => {
    endPanel.style.display = 'none';
    setupPanel.style.display = 'block';
});

endGameBtn.addEventListener('click', () => {
    endGame();
});

if (finishGameBtn) {
    finishGameBtn.addEventListener('click', () => {
        endGame();
    });
}

// 背景音乐控制
toggleMusicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        toggleMusicBtn.textContent = '🔊 关闭音乐';
    } else {
        bgMusic.pause();
        toggleMusicBtn.textContent = '🔇 开启音乐';
    }
});

// 页面加载初始化
window.onload = () => {
    setupPanel.style.display = 'block';
    updateHighScoreDisplay();

    // 尝试自动播放背景音乐
    bgMusic.play().catch(() => {
        toggleMusicBtn.style.display = 'inline-block';
    });
};

// 窗口变化时重置图片位置
window.onresize = () => {
    const images = document.querySelectorAll('.clickImage');
    images.forEach(moveImage);
};