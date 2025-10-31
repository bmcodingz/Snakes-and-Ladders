const board = document.getElementById("board");
const dice = document.getElementById("dice");
const statusDiv = document.getElementById("status");
const svg = document.getElementById("snakes-ladders");

// ساخت جدول ۱۰×۱۰ با جهت زیگزاگی
for (let row = 9; row >= 0; row--) {
    const isLeftToRight = row % 2 === 0;
    for (let col = 0; col < 10; col++) {
        const num = row * 10 + (isLeftToRight ? col + 1 : 10 - col);
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = "cell-" + num;
        cell.textContent = num;
        board.appendChild(cell);
    }
}

// موقعیت مارها و نردبان‌ها
const ladders = { 3: 22, 5: 8, 11: 26, 20: 29, 36: 44, 51: 67, 71: 91 };
const snakes = { 17: 4, 19: 7, 54: 34, 62: 18, 64: 60, 87: 24, 93: 73, 99: 78 };

// محاسبه‌ی مرکز هر سلول
function getCellCenter(n) {
    const cell = document.getElementById("cell-" + n);
    const rect = cell.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return {
        x: rect.left - boardRect.left + rect.width / 2,
        y: rect.top - boardRect.top + rect.height / 2
    };
}

// تابع رسم مار و نردبان (SVG خالص)
function drawSnakesAndLadders() {
    svg.innerHTML = "";

    const boardRect = board.getBoundingClientRect();
    svg.setAttribute("width", boardRect.width);
    svg.setAttribute("height", boardRect.height);
    svg.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);

    // تابع رسم نردبان
    function createLadder(sx, sy, ex, ey) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;

        // بردار عمود
        const px = -uy;
        const py = ux;
        const offset = Math.min(12, len * 0.08);

        const x1 = sx + px * offset;
        const y1 = sy + py * offset;
        const x2 = ex + px * offset;
        const y2 = ey + py * offset;

        const x3 = sx - px * offset;
        const y3 = sy - py * offset;
        const x4 = ex - px * offset;
        const y4 = ey - py * offset;

        // ستون‌ها
        const col1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        col1.setAttribute("x1", x1); col1.setAttribute("y1", y1);
        col1.setAttribute("x2", x2); col1.setAttribute("y2", y2);
        col1.setAttribute("stroke", "#8B5A2B");
        col1.setAttribute("stroke-width", 4);
        col1.setAttribute("stroke-linecap", "round");

        const col2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        col2.setAttribute("x1", x3); col2.setAttribute("y1", y3);
        col2.setAttribute("x2", x4); col2.setAttribute("y2", y4);
        col2.setAttribute("stroke", "#8B5A2B");
        col2.setAttribute("stroke-width", 4);
        col2.setAttribute("stroke-linecap", "round");

        g.appendChild(col1);
        g.appendChild(col2);

        // پله‌ها
        const steps = Math.max(3, Math.floor(len / 40));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const cx = sx + dx * t;
            const cy = sy + dy * t;
            const rx1 = cx + px * (offset - 2);
            const ry1 = cy + py * (offset - 2);
            const rx2 = cx - px * (offset - 2);
            const ry2 = cy - py * (offset - 2);

            const rung = document.createElementNS("http://www.w3.org/2000/svg", "line");
            rung.setAttribute("x1", rx1); rung.setAttribute("y1", ry1);
            rung.setAttribute("x2", rx2); rung.setAttribute("y2", ry2);
            rung.setAttribute("stroke", "#D2B48C");
            rung.setAttribute("stroke-width", 3);
            g.appendChild(rung);
        }

        return g;
    }

    // تابع رسم مار
    function createSnake(sx, sy, ex, ey) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;

        const cp1x = sx + dx * 0.25 + (-uy) * (Math.min(80, len * 0.25));
        const cp1y = sy + dy * 0.25 + (ux) * (Math.min(80, len * 0.25));

        const cp2x = sx + dx * 0.75 + (uy) * (Math.min(80, len * 0.25));
        const cp2y = sy + dy * 0.75 + (-ux) * (Math.min(80, len * 0.25));

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`;
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#2f8f2f");
        path.setAttribute("stroke-width", 8);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        g.appendChild(path);

        // سر مار
        const head = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        head.setAttribute("cx", ex);
        head.setAttribute("cy", ey);
        head.setAttribute("r", 7);
        head.setAttribute("fill", "#145214");
        head.setAttribute("stroke", "#0a2f0a");
        head.setAttribute("stroke-width", 2);
        g.appendChild(head);

        // چشم
        const eye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        eye.setAttribute("cx", ex - uy * 4);
        eye.setAttribute("cy", ey + ux * 4);
        eye.setAttribute("r", 1.5);
        eye.setAttribute("fill", "white");
        g.appendChild(eye);

        return g;
    }

    // رسم نردبان‌ها
    for (let startStr in ladders) {
        const start = Number(startStr);
        const end = ladders[start];
        const s = getCellCenter(start);
        const e = getCellCenter(end);
        const ladder = createLadder(s.x, s.y, e.x, e.y);
        svg.appendChild(ladder);
    }

    // رسم مارها
    for (let startStr in snakes) {
        const start = Number(startStr);
        const end = snakes[start];
        const s = getCellCenter(start);
        const e = getCellCenter(end);
        const snake = createSnake(s.x, s.y, e.x, e.y);
        svg.appendChild(snake);
    }
}

// بعد از بارگذاری صفحه و ساخت جدول اجرا میشه
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(drawSnakesAndLadders, 200);
});

// موقعیت بازیکنان
let positions = [1, 1];
let turn = 0;

function updatePlayers() {
    document.querySelectorAll(".player").forEach(el => el.remove());
    positions.forEach((pos, index) => {
        const player = document.createElement("div");
        player.classList.add("player", "p" + (index + 1));
        const cell = document.getElementById("cell-" + pos);
        if (cell) cell.appendChild(player);
    });
    updateStatus();
}

function updateStatus() {
    const currentPlayer = (turn % 2) + 1;
    statusDiv.textContent = "نوبت بازیکن " + currentPlayer + (currentPlayer === 1 ? " (قرمز)" : " (آبی)");
    const color = currentPlayer === 1 ? "red" : "blue";
    statusDiv.style.color = color;
    dice.style.backgroundColor = color;
    dice.style.color = "white";
}

updatePlayers();

// دکمه تاس
document.getElementById("rollBtn").addEventListener("click", async () => {
    dice.textContent = "-";
    dice.style.transform = "rotate(0deg)";
    setTimeout(() => { dice.style.transform = "rotate(360deg)"; }, 50);

    const currentPlayer = turn % 2;
    const roll = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => dice.textContent = roll, 300);

    let newPos = positions[currentPlayer] + roll;
    if (newPos > 100) newPos = positions[currentPlayer];

    for (let i = positions[currentPlayer] + 1; i <= newPos; i++) {
        positions[currentPlayer] = i;
        updatePlayers();
        await new Promise(r => setTimeout(r, 150));
    }

    if (ladders[newPos]) {
        positions[currentPlayer] = ladders[newPos];
        updatePlayers();
        await new Promise(r => setTimeout(r, 200));
    }

    if (snakes[newPos]) {
        positions[currentPlayer] = snakes[newPos];
        updatePlayers();
        await new Promise(r => setTimeout(r, 200));
    }

    if (positions[currentPlayer] === 100) {
        setTimeout(() => {
            alert("بازیکن " + (currentPlayer + 1) + " برنده شد!");
            positions = [1, 1];
            turn = 0;
            updatePlayers();
            dice.textContent = "-";
            updateStatus();
        }, 400);
        return;
    }

    turn++;
    updateStatus();
});
