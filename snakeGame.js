// https://www.youtube.com/watch?v=uyhzCBEGaBY Based on this tutorial
//          controls sometimes feel unresponsive. When making quick turns where you return to the original direction it might just cancel your turn. Maybe save the direction to a next move variable and make it so that you can only change the direction once per turn.
const board = document.getElementById("gameContainer");
const spaceToStart = document.getElementById("spaceToStart");
const score = document.getElementById("score");
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let obstacle = [{ x: 2, y: 2 }, { x: 19, y: 19 }];
let usedSquares;
let turns = []
let food = generateFood();
let newDirection = 'right';
let direction;
let gameInterval;
let gameSpeedDelay = 200;
let gameStarted = false;
let foodInterval;
let boolean;
let counter;
let turn = [];

//This draws all the existing elements and checks if snake has collided with them or itself
const draw = () => {
    board.innerHTML = '';
    drawSnake();
    checkCollision();
    drawFood();
    drawBlock();
    updateScore();
    if (boolean === true) {
        foodReGenerator();
    }
}
//each snakepart is a div with class snake apart from
//the head snake[0]. Turns have extra class to round the right corner so the snake looks less blocky
function drawSnake() {
    let snakeElement;
    let turnIndex = -1;
    //find the parts of snake that have turns in them
    //turns is an array of turn coordinate objects
    for (part of snake) {
        const matchCoordinates = turns.find(turnCoords => turnCoords.x === part.x && turnCoords.y === part.y)
        if (part === snake[0]) {
            snakeElement = createGameElement('div', `snakeHead ${newDirection}`);
            setPosition(snakeElement, part);
            board.appendChild(snakeElement);
        }
        //if turns.find finds a match it will go here
        //turnIndex++ fixes turns to have the right index. original value is -1
        else if (matchCoordinates) {
            turnIndex++;
            snakeElement = createGameElement('div', `snake ${turn[turnIndex]}`);
            setPosition(snakeElement, turns[turnIndex]);
            board.appendChild(snakeElement);
        }
        else {
            snakeElement = createGameElement('div', `snake`);
            setPosition(snakeElement, part);
            board.appendChild(snakeElement);
        }
    }
    turnIndex = -1;
    //outside for loop we return original value
}

//turn array has the direction and new direction combined as a string of two directions. Turns array has the coordinates. They are created from scratch and the indexes match everywhere so we can match the right css class with the right turn

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
        generateObstacle();
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
        //whenever you eat: new food is created. When food is succesfully placed on map it then creates a new obstacle(this happens in generateFood func)
        if (head.x === food.x && head.y === food.y) {
            food = generateFood();
            increaseSpeed();
            clearInterval(gameInterval); //clear past interval
            clearTimeout(foodInterval);
            //if food is not touched in 10 secs it will regenerate somewhere else once
            foodReGenerator();
            gameInterval = setInterval(() => {
                //making sure snake head doesn't turn 180 within an interval
                if ((direction === 'up' && newDirection === 'down') || (direction === 'down' && newDirection === 'up') || (direction === 'left' && newDirection === 'right') || (direction === 'right' && newDirection === 'left') || direction === newDirection) {
                }
                else if (direction !== newDirection) {
                    turn.push(direction + newDirection);
                    counter = 1;
                    console.log(turn);
                    direction = newDirection;
                    turns.push(snake[0]);
                }
                else {
                    console.log(error)
                }
                if (turns[0] === snake[(snake.length - 1)]) {
                    turns.shift();
                    turn.shift();
                }
                if (counter === (snake.length - 1)) {
                    console.log("delete turns")
                    turns = [];
                    turn = [];
                }
                move();
                checkCollision();
                draw();
                counter++;
            }, gameSpeedDelay);

        } else {
            snake.pop();
        }
    }
    else { food = generateFood };
}

function foodReGenerator() {
    boolean = false;
    clearTimeout(foodInterval);
    foodInterval = setTimeout(() => {
        food = generateFood();
        boolean = true;
    }, 10000);
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
    } else if (gameSpeedDelay > 123) {
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
    if (currentScore === 100) {
        board.style.background = "turquoise";
    }
    else if (currentScore === 200) {
        board.style.background = "orange";
    }
    else if (currentScore === 300) {
        board.style.background = "pink";
    }
}
function resetGame() {
    stopGame();
    snake = [{ x: 10, y: 10 }];
    turns = [];
    turn = [];
    food = generateFood();
    obstacle = [{ x: 2, y: 2 }, { x: 19, y: 19 }];
    direction = 'right';
    newDirection = 'right';
    gameSpeedDelay = 200;
    board.style.background = "#aa8a23";
}
function stopGame() {
    spaceToStart.style.display = 'block';
    clearInterval(gameInterval);
    gameStarted = false;
}
document.addEventListener('keydown', handleKeyDown);