function new_game() {
}

function make_move() {
    var board = get_board();

    // we found an item! take it!
    var roboX = get_my_x();
    var roboY = get_my_y();
    if (board[roboX][roboY] > 0) {
       return TAKE;
    }

    var bestDistance = Number.POSITIVE_INFINITY;
    var bestMove = PASS;
    for (var x = 0; x < WIDTH; ++x) {
        for (var y = 0; y < HEIGHT; ++y) {
            if (board[x][y] > 0) {
                var movesAndDirection = getMovesAndDirection(new Node(roboX, roboY), new Node(x, y));        

                if (movesAndDirection[0] <= bestDistance) {
                    /*
                    if ((bestDistance != Number.POSITIVE_INFINITY) && (isOpponentNearer(new Node(x, y), bestDistance))) {
                        continue;
                    }*/
                    //console.log('Robo x =' + roboX + ', Robo y=' + roboY + ', Fruit x=' + x + ', Fruit y=' + y);
                    bestDistance = movesAndDirection[0];
                    bestMove =  movesAndDirection[1];
                    //console.log('Best distance:' + bestDistance + ', Best move:' + bestMove);
                }
            }
        }
    }

    return bestMove;
}

function getMovesAndDirections(node) {
    var roboX = node.x, roboY = node.y;
    var ret = [];
    for (var x = 0; x < WIDTH; ++x) {
        for (var y = 0; y < HEIGHT; ++y) {
            if (board[x][y] > 0) {
                best.push(getMovesAndDirection(new Node(roboX, roboY), new Node(x, y)));
            }
        }
    }

    return ret;
}

function isOpponentNearer(fruitNode, myMoveCount) {
    var fruitX = fruitNode.x, fruitY = fruitNode.y;
    var x = get_opponent_x();    
    var y = get_opponent_y();    

    var opponentMoves = getMovesAndDirection(new Node(x, y), new Node(fruitX, fruitY))[0];

    return opponentMoves < myMoveCount;
}

function Node(x, y) {
    this.x = x;
    this.y = y;
}

function getMovesAndDirection(roboNode, fruitNode) {
    var roboX = roboNode.x, roboY = roboNode.y, fruitX = fruitNode.x, fruitY = fruitNode.y;
    //assumes that the fruit and robo are not on the same square
    var distance = 0;
    var direction= PASS;
    if (roboY == fruitY) { //they are on the same row
        if (roboX > fruitX) { 
            distance = roboX - fruitX;
            direction = WEST;
        } else {
            distance = fruitX - roboX;
            direction = EAST;
        }
    }

    if (roboX == fruitX) { //they are on the same column
        if (roboY > fruitY) {
            distance = roboY - fruitY;
            direction = NORTH;
        } else {
            distance = fruitY - roboY;
            direction = SOUTH;
        }
    }

    if ((fruitX > roboX) && (fruitY < roboY)) { //fruit upper right
        distance = fruitX - roboX + roboY - fruitY;
        direction = EAST;
    }

    if ((fruitX > roboX) && (fruitY > roboY)) { //fruit lower right
        distance = fruitX - roboX + fruitY - roboY;
        direction = EAST;
    }

    if ((fruitX < roboX) && (fruitY > roboY)) { //fruit lower left 
        distance = roboX - fruitX + fruitY - roboY;
        direction = WEST;
    }

    if ((fruitX < roboX) && (fruitY < roboY)) { //fruit upper left
        distance = roboX - fruitX + roboY - fruitY;
        direction = WEST;
    }

    //console.log('Distance=' + distance + ', Direction=' + direction);
    return Array(distance, direction);
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


