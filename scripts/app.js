const CANVAS_WIDTH = 290;
const CANVAS_HEIGHT = 580;
const CANVAS_BACKGROUND = '#ffffff'

const ROW_NUMBERS = 20;
const COLUMNS_NUMBERS = 10;
const PADDING = 2;

const START_BLOCK_NUMBERS = [1, 3, 6, 7, 10, 13, 19];
const COLORS = ['#259E1A', '#0FBC00', '#39DA66', '#1BC000', '#8EE281', '#6ECE0E'];

const fieldWidth = CANVAS_WIDTH / COLUMNS_NUMBERS;
const fieldHeight = CANVAS_HEIGHT / ROW_NUMBERS;

const game1 = getGame(document.querySelector('#canvas1'));
const game2 = getGame(document.querySelector('#canvas2'));

game1.start();
game2.start();

listen('KeyA', game1.moveBlockLeft);
listen ('KeyD', game1.moveBlockRight);
listen ('KeyW', game1.rotateBlock);
listen ('KeyS', game1.moveBlockDown);

listen('ArrowLeft', game2.moveBlockLeft);
listen ('ArrowRight', game2.moveBlockRight);
listen ('ArrowUp', game2.rotateBlock);
listen ('ArrowDown', game2.moveBlockDown);

game1.updateStatus = function updateStatus(scope, level, tetris){
    const element = document.querySelector('#status1');

    element.querySelector('[data-role="tetris"]').textContent = tetris;
    element.querySelector('[data-role="level"]').textContent = level;
    element.querySelector('[data-role="scope"]').textContent = scope;
}

game2.updateStatus = function updateStatus(scope, level, tetris){
    const element = document.querySelector('#status2');

    element.querySelector('[data-role="tetris"]').textContent = tetris;
    element.querySelector('[data-role="level"]').textContent = level;
    element.querySelector('[data-role="scope"]').textContent = scope;
}

function listen (code, handler) {
    document.body.addEventListener('keydown', function(event) {
        if (event.code === code) {
            event.preventDefault();
            handler();
        }
    })
};

function getGame (canvas) { 
    const context = canvas.getContext('2d');

    const map = getMap();

    let scope = 0;
    let level = 1;
    let tetris = 0;

    let block = getBlock(
        getRandomFrom(START_BLOCK_NUMBERS), 
        getRandomFrom(COLORS)
    );
    let downTime = getDownTime();


    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const game = {
        start,
        moveBlockLeft,
        moveBlockRight,
        rotateBlock,
        moveBlockDown,
        updateStatus
    };
    
    return game;

    function updateStatus(scope, level, tetris) {};

    function start() {
        requestAnimationFrame(tick)
    };

    function tick (timestamp) {
        if (timestamp >= downTime) {
            const blockCopy = block.getCopy();
            blockCopy.y++;

            if (canBlockExists(blockCopy)) {
                block = blockCopy
            } else {
                saveBlock();
                const lines = clearLines();

                if (lines === 4) {
                    tetris++
                };

                scope = scope + lines * 100;
                level = 1 + parseInt(scope / 300);

                block = getBlock(
                    getRandomFrom(START_BLOCK_NUMBERS), 
                    getRandomFrom(COLORS)
                );

                game.updateStatus(scope, level, tetris);

                if (!canBlockExists(block)){
                    alert('Конец игры!');
                    return;
                };
            };

            downTime = timestamp + getDownTime();
        };

        clearCanvas();
        drawBlock();
        drawState();

        requestAnimationFrame(tick);
    };

    function getDownTime() {
        return 100 + 900 / level;
    };

    function getRandomFrom (array) {
        const index = Math.floor(Math.random() * array.length);
        return array[index];
    };

    function clearCanvas () {
        context.fillStyle = CANVAS_BACKGROUND;
        context.strokeStyle = 'black';

        context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.fill();
        context.stroke();
    };

    function drawField (x, y, color) {
        context.fillStyle = color;
        context.fillRect(x * fieldWidth +PADDING, y * fieldHeight +PADDING, fieldWidth - 2 * PADDING, fieldHeight - 2 * PADDING);
    };

    function drawBlock() {
        for (const part of block.getIncludedParts()) {
            drawField(part.x, part.y, block.color)
        };
    }

    function clearLines() {
        let lines = 0;

        for (let y = ROW_NUMBERS - 1; y >= 0; y--) {
            let flag = true;

            for (let x = 0; x< COLUMNS_NUMBERS; x++) {
                if (!getField(x,y)) {
                    flag = false;
                    break;
                }
            };

            if (flag) {
                lines++;

                for (t = y; t >= 1; t--) {
                    for (let x = 0; x< COLUMNS_NUMBERS; x++) {
                        map[t][x] = map[t-1][x];
                        map[t-1][x] = null;
                    }
                };

                y++;
            };
        };

        return lines;
    };

    function getMap() {
        const map = [];

        for (let y = 0; y < ROW_NUMBERS; y++) {
            const row = [];

            for (let x = 0; x < COLUMNS_NUMBERS; x++) {
                row.push(null)
            };

            map.push(row);
        };

        return map;
    };

    function saveBlock() {
        for (const part of block.getIncludedParts()) {
            setField(part.x, part.y, block.color)
        };
    }

    function drawState () {
        for (let y = 0; y < ROW_NUMBERS; y++) {
            for (let x = 0; x < COLUMNS_NUMBERS; x++) {
                const field = map[y][x];

                if (field) {
                    drawField(x, y, field)
                };
            };
        };
    };

    function getBlock (type, color = 'black', x = 4, y = 0) {
        const block = {
            type,
            x,
            y,
            color
        };

        block.getIncludedParts = function () {
            const p = (dx,dy) => ({ x: block.x + dx, y: block.y + dy });

            switch (block.type) {
                case 1:
                    return [p(0, 0), p(1, 0), p(0, 1), p(1, 1)]
                case 2:
                    return [p(0, 0), p(-1, 0), p(0, -1), p(1, 0)]
                case 3:
                    return [p(0, 0), p(-1, 0), p(0, 1), p(1, 0)]
                case 4:
                    return [p(0, 0), p(0, -1), p(1, 0), p(0, 1)]
                case 5:
                    return [p(0, 0), p(0, -1), p(-1, 0), p(0, 1)]
                case 6:
                    return [p(0, 0), p(-1, 1), p(0, 1), p(1, 0)]
                case 7:
                    return [p(0, 0), p(-1, 0), p(0, 1), p(1, 1)]
                case 8:
                    return [p(0, 0), p(-1, -1), p(-1, 0), p(0, 1)]
                case 9:
                    return [p(0, 0), p(0, -1), p(-1, 0), p(-1, 1)]
                case 10:
                    return  [p(0, 0), p(-1, 0), p(1, 0), p(2, 0)]
                case 11:
                    return [p(0, 0), p(0, -1), p(0, 1), p(0, 2)]
                case 12:
                    return [p(0, 0), p(1, 0), p(0, 1), p(0, 2)]
                case 13:
                    return [p(0, 0), p(-2, 0), p(-1, 0), p(0, 1)]
                case 14:
                    return [p(0, 0), p(0, -2), p(0, -1), p(-1, 0)]
                case 15:
                    return [p(0, 0), p(0, -1), p(1, 0), p(2, 0)]
                case 16:
                    return [p(0, 0), p(-1, 0), p(0, 1), p(0, 2)]
                case 17:
                    return [p(0, 0), p(0, -1), p(-2, 0), p(-1, 0)]
                case 18:
                    return [p(0, 0), p(0, -2), p(0, -1), p(1, 0)]
                case 19:
                    return [p(0, 0), p(1, 0), p(2, 0), p(0, 1)]
            };

        };

        block.getNextBlock = function () {
            const p = n => getBlock(n, block.color, block.x, block.y);

            switch (block.type) {
                case 1:
                    return p(1)
                case 2:
                    return p(4)
                case 3:
                    return p(5)
                case 4:
                    return p(3)
                case 5:
                    return p(2)
                case 6:
                    return p(8)
                case 7:
                    return p(9)
                case 8:
                    return p(6)
                case 9:
                    return p(7)
                case 10:
                    return p(11)
                case 11:
                    return p(10)
                case 12:
                    return p(13)
                case 13:
                    return p(14)
                case 14:
                    return p(15)
                case 15:
                    return p(12)
                case 16:
                    return p(17)
                case 17:
                    return p(18)
                case 18:
                    return p(19)
                case 19:
                    return p(16)
            }
        };

        block.getCopy = function() {
            return getBlock (block.type, block.color, block.x, block.y)
        };

        return block;
    };

    function canBlockExists(block) {
        for (const part of block.getIncludedParts()) {
            if (getField(part.x, part.y)) {
                return false
            };
        };
        return true;
    };

    function getField (x, y) {
        if (map[y] === undefined || map[y][x] === undefined) {
            return 'black'
        };

        return map[y][x];
    };

    function setField (x, y, value) {
        if (map[y] === undefined || map[y][x] === undefined) {
            return 
        };

        return map[y][x] = value;
    };

    function moveBlockLeft() {
        const blockCopy = block.getCopy();
        
        blockCopy.x = blockCopy.x - 1;
        
        if (canBlockExists(blockCopy)){
            block = blockCopy
        };
    };

    function moveBlockRight() {
        const blockCopy = block.getCopy();
        
        blockCopy.x = blockCopy.x + 1;
        
        if (canBlockExists(blockCopy)){
            block = blockCopy
        };
    };

    function rotateBlock() {
        const blockCopy = block.getNextBlock();
            
            if (canBlockExists(blockCopy)){
                block = blockCopy
            };
    };

    function moveBlockDown() {
        const blockCopy = block.getCopy();

        blockCopy.y = blockCopy.y + 1;

        if (canBlockExists(blockCopy)){
            block = blockCopy
        };
    }

};
