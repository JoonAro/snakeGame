// https://www.youtube.com/watch?v=uyhzCBEGaBY Based on this tutorial
const board = document.getElementById("gameContainer");
const spaceToStart = document.getElementById("spaceToStart");
const score = document.getElementById("score");
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let obstacle = [{ x: 2, y: 2 }, { x: 19, y: 19 }];
let usedSquares;
let food = generateFood();
let newDirection = 'right';
let direction;
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;
let foodInterval;
//This draws all the existing elements and checks if snake has collided with them or itself
const draw = () => {
    board.innerHTML = '';
    drawSnake();
    checkCollision();
    drawFood();
    drawBlock();
    updateScore();
}
//each snakepart is a div with class snake
function drawSnake() {
    snake.forEach((part) => {
        const snakeElement = createGameElement('div', 'snake');
        setPosition(snakeElement, part)
        board.appendChild(snakeElement);
    });
}
function drawFood() {
    if (food !== undefined) {
        const foodElement = createGameElement('div', 'food');
        setPosition(foodElement, food);
        board.appendChild(foodElement);
    }
    else { food = generateFood(); }
}
//this creates the blockElement which is a div with the class obstacle 
function drawBlock() {
    obstacle.forEach((block) => {
        const blockElement = createGameElement('div', 'obstacle');
        setPosition(blockElement, block)
        board.appendChild(blockElement);
    });
}
//create a snakepart, food or obstacle
function createGameElement(div, styleClass) {
    const element = document.createElement(div);
    element.className = styleClass;
    return element;
}
//set the position of snake, food or obstacle
function setPosition(element, position) {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
}
//used squares is equal to snake and obstacle arrays combined
function generateFood() {
    usedSquares = [...snake, ...obstacle]
    let posIsOccupied = false;
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    usedSquares.forEach(pos => {
        if (pos.x === x && pos.y === y) {
            posIsOccupied = true;
        }
    });
    if (posIsOccupied === true) {
        posIsOccupied = false;
        food = generateFood();
    }
    else if (posIsOccupied === false) {
        return { x, y };
    }
    else food = generateFood();
}

function generateObstacle() {
    let posIsOccupied = false;
    const x = Math.floor(Math.random() * gridSize) + 1;
    const y = Math.floor(Math.random() * gridSize) + 1;
    usedSquares.map((snakepart) => {
        if (snakepart.x === x && snakepart.y === y) {
            posIsOccupied = true;
        }
    });
    if (posIsOccupied === true) {
        posIsOccupied = false;
        return generateObstacle();
    }
    else {
        obstacle.push({ x, y });
    }
}
//moving the snake
function move() {
    const head = { ...snake[0] };
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    snake.unshift(head);
    //sometimes food is undefined so this if statement clears it
    if (food !== undefined) {
        //whenever you eat obstacle and new food is created
        if (head.x === food.x && head.y === food.y) {
            generateObstacle();
            food = generateFood();
            increaseSpeed();
            clearInterval(gameInterval); //clear past interval
            clearTimeout(foodInterval);
            //if food is not touched in 10 secs it will regenerate somewhere else once
            foodInterval = setTimeout(() => {
                food = generateFood();
            }, 10000);
            gameInterval = setInterval(() => {
                //making sure snake head doesn't turn 180 within an interval
                if ((direction === 'up' && newDirection === 'down') || (direction === 'down' && newDirection === 'up') || (direction === 'left' && newDirection === 'right') || (direction === 'right' && newDirection === 'left')) {
                    move();
                    checkCollision();
                    draw();
                }
                else {
                    direction = newDirection;
                    move();
                    checkCollision();
                    draw();
                }
            }, gameSpeedDelay);

        } else {
            snake.pop();
        }
    }
    else { food = generateFood };
}
function startGame() {
    gameStarted = true;
    spaceToStart.style.display = 'none';
    gameInterval = setInterval(() => {
        direction = newDirection;
        move();
        checkCollision();
        draw();
    }, gameSpeedDelay,);
}
//keypress listener
function handleKeyDown(event) {
    if ((!gameStarted && event.code === 'Space') || (!gameStarted && event.code === ' ')) {
        startGame();
    }
    else {
        switch (event.key) {
            case 'ArrowUp':
                if (newDirection === 'down') {
                    break;
                }
                else {
                    newDirection = 'up';
                    break;
                }
            case 'ArrowDown':
                if (newDirection === 'up') {
                    break;
                }
                else {
                    newDirection = 'down';
                    break;
                }
            case 'ArrowLeft':
                if (newDirection === 'right') {
                    break;
                }
                else {
                    newDirection = 'left';
                    break;
                }
            case 'ArrowRight':
                if (newDirection === 'left') {
                    break;
                }
                else {
                    newDirection = 'right';
                    break;
                }
        }
    }
}
function increaseSpeed() {
    if (gameSpeedDelay > 150) {
        gameSpeedDelay -= 5;
    } else if (gameSpeedDelay > 100) {
        gameSpeedDelay -= 3;
    }
}
function checkCollision() {
    const head = snake[0];
    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
        resetGame();
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            resetGame();
        }
        else if (obstacle[i].x !== undefined && head.x === obstacle[i].x && head.y === obstacle[i].y) {
            resetGame();
        }
    }
}
function updateScore() {
    const currentScore = (snake.length - 1) * 10;
    score.textContent = "Score " + currentScore.toString();
}
function resetGame() {
    stopGame();
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    obstacle = [{ x: 2, y: 2 }, { x: 19, y: 19 }];
    direction = 'right';
    gameSpeedDelay = 200;
}
function stopGame() {
    spaceToStart.style.display = 'block';
    clearInterval(gameInterval);
    gameStarted = false;
}
document.addEventListener('keydown', handleKeyDown);