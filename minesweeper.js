class Cell {
  constructor(rowIndex, columnIndex) {
    this.hasBomb = false;
    this.marked = false;
    this.opened = false;
    this.value = 0;
    this.rowIndex = rowIndex;
    this.columnIndex = columnIndex;
  }

  static getCell(coordinates) {
    const ROW = parseInt(coordinates / 9);
    const COLUMN = coordinates % 9;
    console.log(`return ${ROW} ${COLUMN}`);
    return cells[ROW][COLUMN];
  }

  mark() {
    if (this.opened || (!this.marked && flags <= 0)) {
      return;
    }
    const COORDINATES = this.columnIndex + this.rowIndex * 9;
    const ID = "cell" + COORDINATES.toString();
    let cell = document.getElementById(ID);

    if (this.marked) {
      this.marked = false;
      flags++;

      // code to unmark
      cell.innerHTML =
        COORDINATES % 2 === 0
          ? `<td id="${ID}" class="evenCell 
                  gameCell"></td>`
          : `<td id="${ID}" class="oddCell gameCell"></td>`;

      if (this.hasBomb) {
        bombsLeft++;
      }
      console.log("unmarked");
    } else {
      this.marked = true;
      flags--;

      // code to mark
      cell.innerHTML =
        COORDINATES % 2 === 0
          ? `<td id="${ID}" class="evenCell gameCell">🚩</td>`
          : `<td id="${ID}" class="oddCell gameCell">🚩</td>`;

      if (this.hasBomb) {
        if (--bombsLeft <= 0) {
          win();
        }
      }
      console.log("marked");
    }

    document.getElementById("flagCounter").textContent = `${flags} Flags🚩`;
  }

  openCell() {
    if (this.opened) return;

    this.opened = true;
    openedCells++;

    const ID = "cell" + (this.columnIndex + this.rowIndex * 9).toString();
    let cell = document.getElementById(ID);
    console.log(cell);
    console.log(this.value);
    console.log(this.hasBomb);

    cell.className =
      parseInt(ID.substring(4)) % 2 === 0 ? "openedEvenCell" : "openedOddCell";
    /**
     * The class name does not include gameCell anymore because the gameCell
     * class only has a cursor: pointer attribute.
     */
    removeEventListeners(cell);

    if (this.value == 0) {
      this.chainReaction();
    } else {
      cell.textContent = this.value;
    }

    if (openedCells >= 81 - bombs) {
      win();
    }
  }

  openAdjacentCell(adjacentCell, denyBlank) {
    if (adjacentCell.value == 0 && denyBlank) {
      return;
    }
    adjacentCell.openCell();
  }

  chainReaction() {
    let adjacentCell;

    for (
      let direction = DIRECTIONS.NORTH;
      direction <= DIRECTIONS.NORTHWEST;
      direction++
    ) {
      try {
        adjacentCell = this.getAdjacentCell(direction);
      } catch (error) {
        console.log(`continue at ${direction}`);
        continue;
      }

      if (!adjacentCell.opened && !adjacentCell.marked) {
        this.openAdjacentCell(adjacentCell, direction % 2 == 1);
      }
    }
  }

  getAdjacentCell(direction) {
    let column = this.columnIndex;
    let row = this.rowIndex;
    switch (direction) {
      case DIRECTIONS.NORTH: {
        row--;
        break;
      }
      case DIRECTIONS.NORTHEAST: {
        row--;
        column++;
        break;
      }
      case DIRECTIONS.EAST: {
        column++;
        break;
      }
      case DIRECTIONS.SOUTHEAST: {
        row++;
        column++;
        break;
      }
      case DIRECTIONS.SOUTH: {
        row++;
        break;
      }
      case DIRECTIONS.SOUTHWEST: {
        row++;
        column--;
        break;
      }
      case DIRECTIONS.WEST: {
        column--;
        break;
      }
      case DIRECTIONS.NORTHWEST: {
        row--;
        column--;
        break;
      }
    }

    if (row < 0 || row > 8 || column < 0 || column > 8)
      throw new Error("Direction is null");

    return cells[row][column];
  }
}

const DIRECTIONS = {
  NORTH: 0,
  NORTHEAST: 1,
  EAST: 2,
  SOUTHEAST: 3,
  SOUTH: 4,
  SOUTHWEST: 5,
  WEST: 6,
  NORTHWEST: 7,
};

let bombs;
let bomb_coordinates;
let bombsLeft;
let flags;
let cells;
let openedCells;

function initCells() {
  const CELLS = [];
  for (let row = 0; row < 9; row++) {
    CELLS.push([]);
    for (let column = 0; column < 9; column++)
      CELLS[row].push(new Cell(row, column));
  }
  console.log(CELLS);
  return CELLS;
}

function plantBombs() {
  let random, rowIndex, colIndex, cell;
  for (let i = 0; i < bombs; i++) {
    console.log("yow");
    random = Math.floor(Math.random() * 81);
    rowIndex = parseInt(random / 9);
    colIndex = random % 9;
    cell = cells[rowIndex][colIndex];
    console.log(`row = ${rowIndex} col = ${colIndex}`);
    if (cell.hasBomb) {
      i--;
      continue;
    }
    cell.hasBomb = true;
    bomb_coordinates.push(random);

    incrementAdjacentCells(cell);
  }
  console.log(bomb_coordinates);
  console.log("damn");
}

function incrementAdjacentCells(cell) {
  let adjacentCell;
  for (
    let direction = DIRECTIONS.NORTH;
    direction <= DIRECTIONS.NORTHWEST;
    direction++
  ) {
    try {
      adjacentCell = cell.getAdjacentCell(direction);
      adjacentCell.value++;
    } catch (error) {}
  }
}

function showBombs() {
  let cell, id;
  for (c of bomb_coordinates) {
    id = "cell" + c.toString();
    cell = document.getElementById(id);
    cell.innerHTML =
      c % 2 === 0
        ? `<td id="${id}" class="evenCell gameCell">💣</td>`
        : `<td id="${id}" class="oddCell gameCell">💣</td>`;
  }
}

function win() {
  alert("Congratulations! You win!");
  location.reload();
}

function lose() {
  showBombs();
  alert("Try again!");
  pauseGameInteraction();
  setTimeout(function () {
    location.reload();
  }, 2000);
}

function pauseGameInteraction() {
  const ODD_CELLS = document.querySelectorAll(".oddCell");
  ODD_CELLS.forEach(function (cell) {
    removeEventListeners(cell);
  });

  const EVEN_CELLS = document.querySelectorAll(".evenCell");
  EVEN_CELLS.forEach(function (cell) {
    removeEventListeners(cell);
  });
}

function attachEventListeners(cell) {
  cell.addEventListener("click", leftClick);

  cell.addEventListener("contextmenu", rightClick);
}

function leftClick(event) {
  let gcell = Cell.getCell(
    parseInt(event.target.closest(".gameCell").id.substring(4))
  );
  if (gcell.marked) {
    return;
  }
  if (gcell.hasBomb) {
    lose();
    return;
  }
  gcell.openCell();
}

function rightClick(event) {
  let gcell = Cell.getCell(
    parseInt(event.target.closest(".gameCell").id.substring(4))
  );
  gcell.mark();
  // Prevent the default context menu from appearing
  event.preventDefault();
}

function removeEventListeners(cell) {
  cell.removeEventListener("click", leftClick);
  cell.removeEventListener("contextmenu", rightClick);
}

// function openMineSweeper(mode) {
//   alert(mode);
//   switch (mode) {
//     case "easy": {
//       window.location.href = "minesweeper.html"; // Redirect to the minesweeper.html page
//       break;
//     }
//     case "medium": {
//       window.location.href = "minesweeper2.html"; // Redirect to the minesweeper.html page

//       break;
//     }
//     case "hard": {
//       window.location.href = "minesweeper3.html"; // Redirect to the minesweeper.html page

//       break;
//     }
//   }
//   window.location.href = "minesweeper.html"; // Redirect to the minesweeper.html page
// }

function main() {
  bombs = parseInt(
    document.getElementById("flagCounter").textContent.slice(0, 2)
  );
  cells = initCells();
  bomb_coordinates = [];
  bombsLeft = bombs;
  flags = bombsLeft;
  plantBombs();
  openedCells = 0;
  // showBombs();

  let clickableCells = document.querySelectorAll(".gameCell");

  clickableCells.forEach(function (cell) {
    attachEventListeners(cell);
  });
}
