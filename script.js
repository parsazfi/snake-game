/*
    Author: Parsa Zaeifi
    Website: https://parsazfi.com
    Github: https://github.com/parsazfi
    License: MIT
    © 2025 Parsa Zaeifi
*/

// prevent scrolling by accident
window.addEventListener('keydown', function(e) {
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    if (keysToBlock.includes(e.key)) {
        e.preventDefault();
    }
});

// main game
window.onload = function () {

    let mobile = (/Mobi|Android|iPhone/i.test(navigator.userAgent) /*|| window.innerWidth <= 768*/);


    function setRes(width = true) {
        if (width) {
            if (mobile) return 400;
            return 600;
        }
        else {
            if (mobile) return 600;
            return 500;
        }
    }

    const WIDTH = setRes(true), HEIGHT = setRes(false);
    const UNIT = 20;
    const LEFT = 0, RIGHT = WIDTH - UNIT, TOP = UNIT * 2, BOTTOM = HEIGHT-UNIT;

    const SnakeColor = "#FF2D55", PrizeColor = "#FFA801 ", GameColor = "#0D1B2A", GameBorderColor = "#fff", ScoreColor = "#0D1B2A";
    const SnakeSize = UNIT, PrizeSize = UNIT;
    const SnakeBorder = 0, PrizeBorder = 10;

    let left = document.getElementById("game-left");
    let right = document.getElementById("game-right");
    let up = document.getElementById("game-up");
    let down = document.getElementById("game-down");

    var canvas = document.getElementById("game-canvas");
    var context = canvas.getContext("2d");

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let gameover = false;
    let gameoverLerp = 0.0;

    let win = false;
    let winLerp = 0.0;

    let mode = ''; // u:up, d:down, l:left, r:right
    let inputMode;
    var updatedUnit = false;

    let hint = true;

    function restart() {
        score = 0;
        gameover = false;
        gameoverLerp = 0.0;

        let win = false;
        let winLerp = 0.0;

        //snake
        len = 1;
        range = 0;

        x[0] = randomPosition(WIDTH);
        y[0] = randomPosition(HEIGHT);

        tailX = WIDTH + UNIT;
        tailY = HEIGHT + UNIT;

        mode = '';
        tailDir = '';

        updatedUnit = false;
        tailAppend = false

        //prize
        generatePrize();

        // wall
        wall = false;
    }

    function leftButton () {
        inputMode = 'l';
        if (mode == '') updatedUnit = true;
        if (winLerp >= 1 || gameoverLerp >= 1) restart();
        hint = false;
        //alert("Left Button Clicked!");
    }

    function rightButton () {
        inputMode = 'r';
        if (mode == '') updatedUnit = true;
        if (winLerp >= 1 || gameoverLerp >= 1) restart();
        hint = false;
        //alert("Right Button Clicked!");
    }

    function upButton () {
        inputMode = 'u';
        if (mode == '') updatedUnit = true;
        if (winLerp >= 1 || gameoverLerp >= 1) restart();
        hint = false;
        //alert("Up Button Clicked!");
    }

    function downButton () {
        inputMode = 'd';
        if (mode == '') updatedUnit = true;
        if (winLerp >= 1 || gameoverLerp >= 1) restart();
        hint = false;
        //alert("Down Button Clicked!");
    }

    left.onclick = leftButton;
    right.onclick = rightButton;
    up.onclick = upButton;
    down.onclick = downButton;

    window.addEventListener('keydown', checkKeyCode, false);
    var code;
    function checkKeyCode(e) {
        code = e.keyCode;
        if (code == 37) leftButton();
        else if (code == 38) upButton();
        else if (code == 39) rightButton();
        else if (code == 40) downButton();
        else if (winLerp >= 1 || gameoverLerp >= 1) restart();
    }
    
    // initailize contaier

    function updateScreen() {
        context.beginPath();
        context.roundRect(LEFT, TOP, RIGHT + UNIT, BOTTOM - UNIT , 0);
        context.fillStyle = GameColor;
        context.fill(); 
    }

    let arraySize = (WIDTH*HEIGHT)/(UNIT*UNIT);
    var score = 0;
    const scorePercent = 100 / arraySize;
    function updateScore () {

        context.beginPath();
        context.roundRect(0, 0, WIDTH, UNIT * 2, 0);
        context.fillStyle = GameBorderColor;
        context.fill();

        context.beginPath();
        context.font = "bold 24px Audiowide, sans-serif";
        context.fillStyle = ScoreColor;
        context.textAlign = "center";
        context.fillText(parseFloat(score.toFixed(2)) + '%', WIDTH / 2, UNIT + 5);
        context.fill();
        
        context.stroke();
    }

    var speed = 250;
    if (mobile) {
        speed = 180;
    }

    const MinSpeed = 100, MaxSpeed = 200;
    const ACC = 5;

    function randomPosition(axis) {
        if (axis == WIDTH) 
            return Math.round((Math.random() * (RIGHT - LEFT) + LEFT) / UNIT) * UNIT;
        else
            return Math.round((Math.random() * (BOTTOM - TOP) + TOP) / UNIT) * UNIT;
    }

    const x = new Array(arraySize);
    const y = new Array(arraySize);
    var len = 1;
    var range = 0;

    x[0] = randomPosition(WIDTH);
    y[0] = randomPosition(HEIGHT);

    context.beginPath();
    context.roundRect(x[0], y[0], SnakeSize, SnakeSize, SnakeBorder);
    context.fillStyle = SnakeColor;
    context.fill();
    
    for (let i = 1; i < len; i++) {
        x[i] = x[i-1] - UNIT;
        y[i] = y[0];

        context.beginPath();
        context.roundRect(x[i], y[i], SnakeSize, SnakeSize, SnakeBorder);
        context.fillStyle = SnakeColor;
        context.fill();
        
    }

    var haedX = x[0];
    var headY = y[0];

    var tailX = WIDTH + UNIT;
    var tailY = HEIGHT + UNIT;
    var tailDir = '';
    var tailAppend = false;

    let wall = false;

    // prize

    var px;
    var py;

    const emptyCells = new Array(Math.ceil(arraySize / 4));

    let opx, opy; // old points position
    function generatePrize() {
        if (len <= arraySize /** 3 / 4*/) {
            opx = px;
            opy = py;

            px = randomPosition(WIDTH);
            py = randomPosition(HEIGHT);
            
            //px = RIGHT;
            //py = BOTTOM;
            
            if (opx == px && opy == py) {
                generatePrize();
            } else {
                for (let i = 0; i < len; i++) {
                    if (x[i] == px && y[i] == py) {
                        generatePrize();
                        break;
                    }
                }
            }
        } else {

        }
        
    }

    generatePrize();

    function updatePrize() {
        context.beginPath();
        context.roundRect(px, py, PrizeSize, PrizeSize, PrizeBorder);
        context.fillStyle = PrizeColor;
        context.fill();
    }

    function collision(posX, posY) {
        if ((mode == 'l' && x[0] == (posX + UNIT) && y[0] == posY) ||
            (mode == 'r' && x[0] == (posX - UNIT) && y[0] == posY) ||
            (mode == 'u' && x[0] == posX && y[0] == (posY + UNIT)) ||
            (mode == 'd' && x[0] == posX && y[0] == (posY - UNIT))
        ) return true;
        else if ((mode == 'l' && x[0] == LEFT && posX == RIGHT && y[0] == posY) ||
                 (mode == 'r' && x[0] == RIGHT && posX == LEFT && y[0] == posY) ||
                 (mode == 'u' && y[0] == TOP && posY == BOTTOM && x[0] == posX) ||
                 (mode == 'd' && y[0] == BOTTOM && posY == TOP && x[0] == posX)
        ) return true;
        return false;
    }

    function collisionDetection() {
        //prize
        if (collision(px, py)) {
            if (len < arraySize) {
                generatePrize();
                x[len] = x[len - 1];
                y[len] = y[len - 1];
                len += 1;
                score += scorePercent;
                tailAppend = true;
            }
            else {
                win = true;
            }
            
        }
        //game over
        for (let i = 1; i < len; i++){
            if (collision(x[i], y[i])) {
                gameover = true;
            }
        }
    }

    function allowedInputs() {
        if (len == 1) return true;
        return !(
            ((mode == 'r' || mode == 'l') && (inputMode == 'r' || inputMode == 'l')) ||
            ((mode == 'u' || mode == 'd') && (inputMode == 'u' || inputMode == 'd'))
        );
    }    

    function showSnakeCells() {
        context.beginPath();
        context.roundRect(haedX, headY, SnakeSize, SnakeSize, SnakeBorder);
        context.fillStyle = SnakeColor;
        context.fill();

        for (let i = 0; i < len - 1; i++) {
            context.beginPath();
            context.roundRect(x[i], y[i], SnakeSize, SnakeSize, SnakeBorder);
            context.fillStyle = SnakeColor;
            context.fill();
        }

        if (len > 1) {
            context.beginPath();
            context.roundRect(tailX, tailY, SnakeSize, SnakeSize, SnakeBorder);
            context.fillStyle = "SnakeColor";
            context.fill();
        } 
        else if (len == 1 && wall) {
            context.beginPath();
            context.roundRect(tempHeadX, tempHeadY, SnakeSize, SnakeSize, SnakeBorder);
            context.fillStyle = "SnakeColor";
            context.fill();
        }
    }

    function updateSnakeCells() {
        for (let i = len - 1; i > 0; i--) {
            x[i] = x[i - 1];
            y[i] = y[i - 1];
        }
        x[0] = haedX;
        y[0] = headY;
    }

    function setHeadDirection() {
        if (allowedInputs()) mode = inputMode;
    }

    function setTailDirection(){
        if (len > 1 && !tailAppend) {
            if (x[len-1] - x[len-2] == UNIT  || x[len-2] - x[len-1] > UNIT) tailDir = 'l';
            else if (x[len-2] - x[len-1] == UNIT  || x[len-1] - x[len-2] > UNIT) tailDir = 'r';
            else if (y[len-1] - y[len-2] == UNIT  || y[len-2] - y[len-1] > UNIT) tailDir = 'u';
            else if (y[len-2]- y[len-1] == UNIT  || y[len-1] - y[len-2] > UNIT) tailDir = 'd';
            else tailDir = '';
        }

        tailAppend = false; // tail append is for when the snake eats the prize at first, the increased tail stays in current position until head goes forwars in one unit then follows the path
    }

    let tempHeadX;
    let tempHeadY;

    function updateHeadPosition() {
        if (mode == 'l') {
            if (x[0] == LEFT) {
                haedX = RIGHT + UNIT - range;
                if (len == 1) {
                    tempHeadX = x[0] - range;
                    tempHeadY = y[0];
                    wall = true;
                }
            }
            else {
                haedX = x[0] - range;
            }
        }
        if (mode == 'r') {
            if (x[0] == RIGHT) {
                haedX = LEFT - UNIT + range;
                if (len == 1) {
                    tempHeadX = x[0] + range;
                    tempHeadY = y[0];
                    wall = true;
                }
            }
            else {
                haedX = x[0] + range;
            }
        }
        if (mode == 'u') {
            if (y[0] == TOP) {
                headY = BOTTOM + UNIT - range;
                if (len == 1) {
                    tempHeadX = x[0];
                    tempHeadY = y[0] - range;
                    wall = true;
                }
            }
            else {
                headY = y[0] - range;
            }
        }
        if (mode == 'd') {
            if (y[0] == BOTTOM) {
                headY = TOP - UNIT + range;
                if (len == 1) {
                    tempHeadX = x[0];
                    tempHeadY = y[0] + range;
                    wall = true;
                }
            }
            else {
                headY = y[0] + range;
            }
        }
    }
    
    function updateTailPosition() {
        if (!tailAppend) {
            if (tailDir == 'l') {
                tailX = x[len - 1] - range;
                tailY = y[len - 1];
            }
            else if (tailDir == 'r') {
                tailX = x[len - 1] + range;
                tailY = y[len - 1];
            }
            else if (tailDir == 'u') {
                tailX = x[len - 1];
                tailY = y[len - 1] - range;
            }
            else if (tailDir == 'd') {
                tailX = x[len - 1];
                tailY = y[len - 1] + range;
            }
        }
    }

    function updateSnake(deltaTime) {
        if (updatedUnit) {
            wall = false;
            updateSnakeCells();
            setHeadDirection();
            setTailDirection();
            collisionDetection();
            range = 0;
            updatedUnit = false;
        }
        
        if (!gameover && !win) {
            // set snake lerp animation in movement
            range += speed * deltaTime;
            if (range >= UNIT) {
                range = UNIT;
                //if (x[len - 1] == x[len - 2] && y[len - 1] == y[len - 2])
                //tailX = x[len - 1];
                //tailY = y[len - 1];
                updatedUnit = true;
            }

            updateHeadPosition();
            updateTailPosition();
        }
        
        showSnakeCells();
    }


    function showGameOver() {
        gameoverLerp += 0.015;
        if (gameoverLerp >= 1) {
            gameoverLerp = 1;
        }

        // Rectangle
        context.beginPath();
        context.roundRect(LEFT, TOP, RIGHT + UNIT, BOTTOM - UNIT, 0);
        context.fillStyle = "rgba(242, 242, 242, " + gameoverLerp/1.12 + ")";
        //context.filter = 'blur(' + gameoverLerp*2 + 'px)';
        context.fill();

        // Texts
        context.beginPath();
        context.fillStyle = "rgba(44, 44, 44, " + gameoverLerp + ")";
        context.fontWeight = "800";
        context.textAlign = "center";
        
        
        if (mobile) {
            context.font = "bold 50px Audiowide, sans-serif";
            context.fillText("Game Over", WIDTH / 2, HEIGHT / 2 + UNIT);
            context.font = "11.5px Audiowide, sans-serif";
            context.fillStyle = "rgba(44, 44, 44, " + gameoverLerp + ")";
            context.fillText("Press any key or touch the screen to restart", WIDTH / 2, HEIGHT / 2 + UNIT * 2.5 );
        }
        else {
            context.font = "bold 65px Audiowide, sans-serif";
            context.fillText("Game Over", WIDTH / 2, HEIGHT / 2 + UNIT * 2);
            context.font = "15px Audiowide, sans-serif";
            context.fillStyle = "rgba(44, 44, 44, " + gameoverLerp + ")";
            context.fillText("Press any key or touch the screen to restart", WIDTH / 2, HEIGHT / 2 + UNIT * 4 );
        }
        
        context.fill();
        context.stroke();
    }

    function showWin() {
        winLerp += 0.015;
        if (winLerp >= 1) {
            winLerp = 1;
        }

        // Rectangle
        context.beginPath();
        context.roundRect(LEFT, TOP, RIGHT + UNIT, BOTTOM * 2, 0);
        context.fillStyle = "rgba(255, 249, 227, " + winLerp + ")";
        context.fill();

        // Texts
        context.beginPath();
        context.fontWeight = "800";
        context.textAlign = "center";
        context.fillStyle = "rgba(26, 26, 26, " + winLerp + ")";

        if (mobile) {
            context.font = "bold 50px Audiowide, sans-serif";
            context.fillText("You made it!", WIDTH / 2, HEIGHT / 2 + UNIT);
            context.font = "11.5px Audiowide, sans-serif";
            context.fillStyle = "rgba(255, 79, 94, " + winLerp + ")";
            context.fillText("Press any key or touch the screen to restart", WIDTH / 2, HEIGHT / 2 + UNIT * 3 );
        }
        else {
            context.font = "bold 65px Audiowide, sans-serif";
            context.fillText("You made it!", WIDTH / 2, HEIGHT / 2 + UNIT * 2);
            context.font = "15px Audiowide, sans-serif";
            context.fillStyle = "rgba(255, 79, 94, " + winLerp + ")";
            context.fillText("Press any key or touch the screen to restart", WIDTH / 2, HEIGHT / 2 + UNIT * 4 );
        }
        
        context.fill();
        context.stroke();
    }

    function showHint() {
        context.beginPath();
        context.roundRect(LEFT, TOP, RIGHT + UNIT, BOTTOM * 2, 2);
        context.fillStyle = "rgba(13, 17, 42, 0.7)";
        context.fill();

        // Texts
        context.beginPath();
        context.fontWeight = "800";
        context.fillStyle = "white";
        context.textAlign = "center";

        if (mobile) {
            context.font = "bold 15px Audiowide, sans-serif";
            context.fillText("Touch the screen to start", WIDTH / 2, HEIGHT / 2 + UNIT * 0.375);

            context.font = "26px sans-serif";
            context.fillStyle = "#ddd";
            context.fillText("↑", WIDTH / 2, TOP + 2.5 * UNIT );
            context.fillText("↓", WIDTH / 2, BOTTOM - 1 * UNIT );
            context.fillText("←", LEFT + 3 * UNIT, HEIGHT / 2 + UNIT * 0.5);
            context.fillText("→", RIGHT - 3 * UNIT + 20, HEIGHT / 2 + UNIT * 0.5);
        } else {
            context.font = "bold 26px Audiowide, sans-serif";
            context.fillText("Touch the screen to start", WIDTH / 2, HEIGHT / 2 + UNIT);
            
            context.font = "14px Audiowide, sans-serif";
            context.fillText("You can also press arrow keys on keyboard", WIDTH / 2, HEIGHT / 2 + UNIT * 2.55 );
            
            context.font = "26px sans-serif";
            context.fillStyle = "#ddd";
            context.fillText("↑", WIDTH / 2, TOP + 2.5 * UNIT );
            context.fillText("↓", WIDTH / 2, BOTTOM - 1 * UNIT );
            context.fillText("←", LEFT + 3 * UNIT, HEIGHT / 2 + 2 * UNIT);
            context.fillText("→", RIGHT - 3 * UNIT + 20, HEIGHT / 2 + 2 * UNIT);
        }
        
        context.textAlign = "left";
        context.font = "bold 10.5px Audiowide, sans-serif";
        context.fillStyle = SnakeColor;
        context.fillText("Made by Parsa Zaeifi", LEFT + 10, BOTTOM - UNIT * 3 + UNIT * 3.5 );
        context.fill();
        context.stroke();
    }

    // initial framrate settings
    let oldTimeStamp = 0;
    let deltaTime;

    function gameLoop(timeStamp) {
        // animation and framerate codes
        deltaTime = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;

        context.clearRect(0, 0, WIDTH, HEIGHT);
 
        updateScreen();
        updateSnake(deltaTime);
        updatePrize();
        updateScore();
        
        if (gameover) showGameOver();
        else if (win) showWin();
        else if (hint) showHint();

        //dots();

        window.requestAnimationFrame(gameLoop);
    }

    window.requestAnimationFrame(gameLoop);
    
    function dots() {
        for (let tx = 0; tx <= WIDTH; tx += UNIT) {
            for (let ty = UNIT * 2; ty <= HEIGHT; ty += UNIT) {
                context.fillStyle = "black";
                context.fillRect(tx, ty, 1, 1);
            }
        }
    }
}