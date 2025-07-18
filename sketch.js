let cols, rows;
let w = 40;
let grid = [];
let current;
let stack = [];
let player;
let goal;
let moves = 0;
let won = false;


function setup() {
    createCanvas(400, 400);
    cols = floor(width / w);
    rows = floor(height / w);

    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            let cell = new Cell(i, j);
            grid.push(cell);
        }
    }

    current = grid[0];
    player = { i: 0, j: 0 };
    goal = { i: cols - 1, j: rows - 1};
}


function draw() {
    background(51);

    for (let cell of grid) {
        cell.show();
    }

    drawPlayer();
    drawGoal();

    if (!mazeGenerated()) {
        current.visited = true;
        current.highlight();

        let next = current.checkNeighbors();
        if (next) {
            next.visited = true;
            stack.push(current);

            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    }
}


function drawPlayer() {
    let x = player.i * w + w / 2;
    let y = player.j * w + w / 2;
    fill(255, 0, 0);
    noStroke();
    ellipse(x, y, w / 2);
}


function drawGoal() {
    let x = goal.i * w;
    let y = goal.j * w;
    fill(255, 0, 0);
    noStroke();
    rect(x, y, w, w);
}


function keyPressed() {
    if (won) return;

    let x = player.i;
    let y = player.j;
    let moved = false;

    const movesMap = {
        [UP_ARROW]:    { di:  0, dj: -1, wall: 0 },
        [RIGHT_ARROW]: { di:  1, dj:  0, wall: 1 },
        [DOWN_ARROW]:  { di:  0, dj:  1, wall: 2 },
        [LEFT_ARROW]:  { di: -1, dj:  0, wall: 3 }
    };

    const move = movesMap[keyCode];

    if (move && !grid[index(x, y)].walls[move.wall]) {
        player.i += move.di;
        player.j += move.dj;
        moved = true;
    }
    if (moved) {
        moves++;
        document.getElementById('moves').textContent = moves;
        checkWin();
    }
}


function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) {
    return -1;
  }
  return i + j * cols;
}


class Cell {
  constructor(i, j) {
    this.i = i;
    this.j = j;
    this.walls = [true, true, true, true];
    this.visited = false;
  }

  checkNeighbors() {
    let neighbors = [];

    let top = grid[index(this.i, this.j - 1)];
    let right = grid[index(this.i + 1, this.j)];
    let bottom = grid[index(this.i, this.j + 1)];
    let left = grid[index(this.i - 1, this.j)];

    const directions = [top, right, bottom, left];
    for (let neighbor of directions) {
        if (neighbor && !neighbor.visited) {
            neighbors.push(neighbor);
        }
    }

    if (neighbors.length > 0) {
      let r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }
  }

  show() {
    let x = this.i * w;
    let y = this.j * w;
    stroke(255);
    const wallLines = [
        () => line(x, y, x + w, y),
        () => line(x + w, y, x + w, y + w),
        () => line(x + w, y + w, x, y + w),
        () => line(x, y + w, x, y)
    ];

    this.walls.forEach((hasWall, i) => {
        if (hasWall) wallLines[i]();
    });

    if (this.visited) {
      noStroke();
      fill(100, 200, 255, 100);
      rect(x, y, w, w);
    }
  }

  highlight() {
    let x = this.i * w;
    let y = this.j * w;
    noStroke();
    fill(0, 255, 0);
    rect(x, y, w, w);
  }
}

function removeWalls(a, b) {
    const dx = b.i - a.i;
    const dy = b.j - a.j;

    const wallPairs = {
        "1,0": [1, 3],
        "-1,0": [3, 1],
        "0,1": [2, 0],
        "0,-1": [0, 2]
    };

    const key = `${dx},${dy}`;
    const [aWall, bWall] = wallPairs[key];

    a.walls[aWall] = false;
    b.walls[bWall] = false;
}

function checkWin() {
  if (player.i === goal.i && player.j === goal.j && !won) {
    won = true;
    document.getElementById('status').textContent = "Wygrana!";
  }
}

function mazeGenerated() {
  return grid.every(cell => cell.visited);
}
