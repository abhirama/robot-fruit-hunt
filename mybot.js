function new_game() {
}

function make_move() {
    var board = get_board();

    // we found an item! take it!
    var x = get_my_x();
    var y = get_my_y();
    if (board[x][y] > 0) {
       return TAKE;
    }

    var move = determineBestMove(x, y);

    if (move == PASS) {
        //Go one step up
        var locY = y;
        while ((locY = locY - 1) >= 0) {
            move = determineBestMove(x, locY);
        }

        //If still pass, move down
        if (move == PASS) {
            while ((y = y + 1) < HEIGHT) {
                move = determineBestMove(x, y);
            }
        }
        
    }


    return move;
}

function determineBestMove(x, y) {
    var move = PASS;

    var leastMoves = Number.MAX_VALUE; 
    
    var westMoveCount = goWestTillFruit(x, y);
    console.log('West move count:' + westMoveCount);

    if ((westMoveCount != -1)) {
        leastMoves = westMoveCount;
        move = WEST;
    }

    var eastMoveCount = goEastTillFruit(x, y);
    console.log('East move count:' + eastMoveCount);

    if ((eastMoveCount != -1) && (eastMoveCount < leastMoves)) {
        leastMoves = eastMoveCount;
        move = EAST; 
    }

    var northMoveCount = goNorthTillFruit(x, y);
    console.log('North move count:' + northMoveCount);

    if ((northMoveCount != -1) && (northMoveCount < leastMoves)) {
        leastMoves = northMoveCount;
        move = NORTH;
    }

    var southMoveCount = goSouthTillFruit(x, y);
    console.log('South move count:' + southMoveCount);

    if ((southMoveCount != -1) && (southMoveCount < leastMoves)) {
        move = SOUTH;
    }

    return move;
}

function goWestTillFruit(x, y) {
    var board = get_board();
    var start = x;
    while (isValidMove(x = x - 1, y)) {
        if (board[x][y] > 0) {
            return start - x;
        }
    }
    
    return -1;

}

function goEastTillFruit(x, y) {
    var board = get_board();
    var start = x;
    while (isValidMove(x = x + 1, y)) {
        if (board[x][y] > 0) {
            return x - start;
        }
    }

    return -1;
}

function goNorthTillFruit(x, y) {
    var board = get_board();
    var start = y;
    while (isValidMove(x, y = y - 1)) {
        if (board[x][y] > 0) {
            return start - y;
        }
    }

    return -1;
}

function goSouthTillFruit(x, y) {
    var board = get_board();
    var start = y;
    while (isValidMove(x, y = y + 1)) {
        if (board[x][y] > 0) {
            return y - start;
        }
    }

    return -1;
}

function getSorroundingCount(x, y) {
    var board = get_board();
    var count = 0;

    //Move north            
    if (isValidMove(x, y - 1)) {
        if (board[x][y - 1]) {
            count = count + 1;
        }
    }

    //Move south
    if (isValidMove(x, y + 1)) {
        if (board[x][y + 1]) {
            count = count + 1;
        }
    }

    //Move west 
    if (isValidMove(x - 1, y)) {
        if (board[x - 1][y]) {
            count = count + 1;
        }
    }

    //Move east
    if (isValidMove(x + 1, y)) {
        if (board[x + 1][y]) {
            count = count + 1;
        }
    }
    
    return count; 
}

function isValidMove(x, y) {
    return (x >= 0) && (y >= 0) && (x < WIDTH) && (y < HEIGHT);
}

function northHasFruit(x, y) {
    if (isValidMove(x, y -1)) {
        return get_board()[x, y - 1];
    }

    return 0;
}

function southHasFruit(x, y) {
    if (y + 1 < HEIGHT) {
        return get_board()[x, y + 1];
    }

    return 0;
}

function eastHasFruit(x, y) {
    if (x + 1 < WIDTH) {
        return get_board()[x + 1, y];
    }

    return 0;
}

function westHasFruit(x, y) {
    if (x - 1 >= 0 ) {
        return get_board()[x - 1, y];
    }

    return 0;
}


