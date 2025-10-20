const board = document.getElementById("board");
const dice = document.getElementById("dice");
const statusDiv = document.getElementById("status");
const svg = document.getElementById("snakes-ladders");

// ساخت جدول ۱۰×۱۰ با جهت چپ به راست در ردیف اول
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

// نردبون‌ها و مارها
const ladders = { 3: 22, 5: 8, 11: 26, 20: 29, 36: 44, 51: 67, 71: 91 };
const snakes = { 17: 4, 19: 7, 54: 34, 62: 18, 64: 60, 87: 24, 93: 73, 99: 78 };

function getCellCenter(n) {
    const cell = document.getElementById("cell-" + n);
    const rect = cell.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    return { x: rect.left - boardRect.left + rect.width / 2, y: rect.top - boardRect.top + rect.height / 2 };
}

// رسم مار و نردبون بعد از لود کامل صفحه
window.onload = function () {
    svg.innerHTML = "";

    // رسم نردبون‌ها
    for (let start in ladders) {
        const end = ladders[start];
        const s = getCellCenter(start);
        const e = getCellCenter(end);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", s.x);
        line.setAttribute("y1", s.y);
        line.setAttribute("x2", e.x);
        line.setAttribute("y2", e.y);
        line.classList.add("ladder");
        svg.appendChild(line);
    }

    // رسم مارها با منحنی زیبا
    for (let start in snakes) {
        const end = snakes[start];
        const s = getCellCenter(start);
        const e = getCellCenter(end);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const midX = (s.x + e.x) / 2;
        const midY = (s.y + e.y) / 2 - 40;
        path.setAttribute("d", `M${s.x},${s.y} Q${midX},${midY} ${e.x},${e.y}`);
        path.classList.add("snake");
        svg.appendChild(path);
    }
};

// موقعیت بازیکنان و نوبت
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

// آپدیت وضعیت نوبت بازیکن با رنگ و تغییر رنگ تاس
function updateStatus() {
    const currentPlayer = (turn % 2) + 1;
    statusDiv.textContent = "نوبت بازیکن " + currentPlayer + (currentPlayer === 1 ? " (🔴)" : " (🔵)");

    // تغییر رنگ متن نوبت
    const color = currentPlayer === 1 ? "red" : "blue";
    statusDiv.style.color = color;

    // تغییر رنگ تاس مطابق بازیکن
    dice.style.backgroundColor = color;
    dice.style.color = "white";
}

// مقدار اولیه
updatePlayers();

// دکمه تاس و حرکت بازیکن
document.getElementById("rollBtn").addEventListener("click", async () => {
    dice.textContent = "-";
    dice.style.transform = "rotate(0deg)";
    setTimeout(() => { dice.style.transform = "rotate(360deg)"; }, 50);

    const currentPlayer = turn % 2;
    const roll = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => dice.textContent = roll, 300);

    let newPos = positions[currentPlayer] + roll;
    if (newPos > 100) newPos = positions[currentPlayer];

    // حرکت مهره با انیمیشن
    for (let i = positions[currentPlayer] + 1; i <= newPos; i++) {
        positions[currentPlayer] = i;
        updatePlayers();
        await new Promise(r => setTimeout(r, 150));
    }

    // بررسی نردبون
    if (ladders[newPos]) {
        positions[currentPlayer] = ladders[newPos];
        updatePlayers();
        await new Promise(r => setTimeout(r, 200));
    }

    // بررسی مار
    if (snakes[newPos]) {
        positions[currentPlayer] = snakes[newPos];
        updatePlayers();
        await new Promise(r => setTimeout(r, 200));
    }

    // بررسی برنده
    if (positions[currentPlayer] === 100) {
        setTimeout(() => {
            alert("🏆 بازیکن " + (currentPlayer + 1) + " برنده شد!");
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