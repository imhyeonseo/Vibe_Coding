class Minesweeper {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.mineCount = 10;
        this.board = [];
        this.gameBoard = document.getElementById('game-board');
        this.mineCountDisplay = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer');
        this.gameStatus = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        this.flaggedCount = 0;
        
        this.initGame();
        this.setupEventListeners();
    }
    
    initGame() {
        this.board = [];
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.flaggedCount = 0;
        
        // 보드 초기화
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
        
        this.renderBoard();
        this.updateDisplay();
        this.clearTimer();
        this.gameStatus.textContent = '';
    }
    
    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 첫 클릭 위치와 그 주변에는 지뢰를 놓지 않음
            if (!this.board[row][col].isMine && 
                !(Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].isMine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                                if (this.board[ni][nj].isMine) count++;
                            }
                        }
                    }
                    this.board[i][j].neighborMines = count;
                }
            }
        }
    }
    
    renderBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    updateCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const cellData = this.board[row][col];
        
        cell.className = 'cell';
        cell.textContent = '';
        
        if (cellData.isRevealed) {
            cell.classList.add('revealed');
            if (cellData.isMine) {
                cell.classList.add('mine');
            } else if (cellData.neighborMines > 0) {
                cell.textContent = cellData.neighborMines;
                cell.classList.add(`number-${cellData.neighborMines}`);
            }
        } else if (cellData.isFlagged && !this.gameOver) {
            cell.classList.add('flagged');
        }
    }
    
    revealCell(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed || this.board[row][col].isFlagged) {
            return;
        }
        
        if (!this.gameStarted) {
            this.placeMines(row, col);
            this.gameStarted = true;
            this.startTimer();
        }
        
        this.board[row][col].isRevealed = true;
        
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.gameStatus.textContent = '게임 오버!';
            this.gameStatus.className = 'lose';
            this.clearTimer();
            return;
        }
        
        // 빈 셀이면 주변 셀들도 자동으로 열기
        if (this.board[row][col].neighborMines === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    const ni = row + di;
                    const nj = col + dj;
                    if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                        this.revealCell(ni, nj);
                    }
                }
            }
        }
        
        this.updateCell(row, col);
        this.checkWin();
    }
    
    toggleFlag(row, col) {
        if (this.gameOver || this.board[row][col].isRevealed) {
            return;
        }
        
        this.board[row][col].isFlagged = !this.board[row][col].isFlagged;
        
        if (this.board[row][col].isFlagged) {
            this.flaggedCount++;
        } else {
            this.flaggedCount--;
        }
        
        this.updateCell(row, col);
        this.updateDisplay();
    }
    
    revealAllMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j].isMine) {
                    this.board[i][j].isRevealed = true;
                    this.updateCell(i, j);
                }
            }
        }
    }
    
    checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j].isRevealed && !this.board[i][j].isMine) {
                    revealedCount++;
                }
            }
        }
        
        if (revealedCount === this.rows * this.cols - this.mineCount) {
            this.gameOver = true;
            this.gameStatus.textContent = '승리!';
            this.gameStatus.className = 'win';
            this.clearTimer();
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerDisplay.textContent = this.timer;
        }, 1000);
    }
    
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        this.mineCountDisplay.textContent = this.mineCount - this.flaggedCount;
        this.timerDisplay.textContent = this.timer;
    }
    
    setupEventListeners() {
        this.gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.revealCell(row, col);
            }
        });
        
        this.gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.toggleFlag(row, col);
            }
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.initGame();
        });
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});