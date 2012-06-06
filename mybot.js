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

    var moves = getMoves(new Node(roboX, roboY));
    sortMoves(moves);

    for (var i = 0; i < moves.length; ++i) {
        var move = moves[i];	    
	var foo = new MoveSourroundingCountVO(move, getSorroundingCount(move.destinationNode));    
	//console.dir(foo);
    }
    
    //debugger;

    var opponentMoves = getOpponentMoves();
    sortMoves(opponentMoves);

    var bestMove = decideBestMove(moves, opponentMoves);

    if (bestMove) {
        return bestMove.direction;
    }

    return PASS;
}

function decideBestMove(sortedMyMoves, sortedOpponentMoves) {
    /*
    if (sortedOpponentMoves.length && sortedMyMoves.length) {
        //If the opponent bot is nearer than us to the fruit that we intend to take, skip it and move to the next one.
        if (sortedOpponentMoves[0].destinationNode.equal(sortedMyMoves[0].destinationNode)) {
            if (sortedMyMoves.length > 1) {
                return sortedMyMoves[1];
            }
        }
    }

    if (sortedMyMoves.length) {
        return sortedMyMoves[0];
    }

    return [];
    */

    var sameDistanceMoves = [];
    if (sortedMyMoves.length >= 2) {
        console.log('Sorted my moves');
        console.dir(sortedMyMoves);

        var key = sortedMyMoves[0].distance;
        sameDistanceMoves.push(sortedMyMoves[0]);

        //The idea is to collect moves of the same distance.
        for (var index = 1; index < sortedMyMoves.length; ++index) {
            if (sortedMyMoves[index].distance == key) {
                sameDistanceMoves.push(sortedMyMoves[index]);
            } else {
                break;
            }
        }

        console.log('Same distance moves');
        console.dir(sameDistanceMoves);

        //Return the move which has the maximum no of sorrounding fruits.
        var sorroundingMoveCounts = [];
        for (var index = 0; index < sameDistanceMoves.length; ++index) {
            var move = sameDistanceMoves[index];
            sorroundingMoveCounts.push(new MoveSourroundingCountVO(move, getSorroundingCount(move.destinationNode)));    
        }

        sorroundingMoveCounts.sort(function(s0, s1){
            return s1.count - s0.count;
        });

        console.log('Sorrounding move counts');
        console.dir(sorroundingMoveCounts);
        return sorroundingMoveCounts[0].move;
    } else {
        if (sortedMyMoves.length) {
            return sortedMyMoves[0];
        }

        return [];
    }


}

function getMoves(node) {
    var roboX = node.x, roboY = node.y;
    var ret = [];
    var board = get_board();
    for (var x = 0; x < WIDTH; ++x) {
        for (var y = 0; y < HEIGHT; ++y) {
            if (board[x][y] > 0) {
                ret.push(getMove(new Node(roboX, roboY), new Node(x, y)));
            }
        }
    }

    return ret;
}

function getOpponentMoves() {
     return getMoves(new Node(get_opponent_x(), get_opponent_y()));
}


function sortMoves(moves) {
    moves.sort(function(move0, move1){
        return move0.distance - move1.distance;
    });
}

function isOpponentNearer(fruitNode, myMoveCount) {
    var fruitX = fruitNode.x, fruitY = fruitNode.y;
    var x = get_opponent_x();    
    var y = get_opponent_y();    

    var opponentMoves = getMove(new Node(x, y), new Node(fruitX, fruitY))[0];

    return opponentMoves < myMoveCount;
}

function Node(x, y) {
    this.x = x;
    this.y = y;

    var that = this;

    this.equal = function(node) {
        return (that.x == node.x) && (that.y == node.y);
    }
}

function Move(destinationNode, direction, distance) {
    this.destinationNode = destinationNode;
    this.direction = direction;
    this.distance = distance;
}

function MoveSourroundingCountVO(move, count) {
    this.move = move;
    this.count = count;
}

function getMove(roboNode, fruitNode) {
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
    return new Move(fruitNode, direction, distance);
}

function getSorroundingCount(node) {
    //console.dir(node);
    var x = node.x, y = node.y;

    var board = get_board();
    var count = 0;

    //Move north            
    if (isValidMove(x, y - 1)) {
        if (board[x][y - 1] > 0) {
            count = count + 1;
        }
    }

    //Move south
    if (isValidMove(x, y + 1)) {
        if (board[x][y + 1] > 0) {
            count = count + 1;
        }
    }

    //Move west 
    if (isValidMove(x - 1, y)) {
        if (board[x - 1][y] > 0) {
            count = count + 1;
        }
    }

    //Move east
    if (isValidMove(x + 1, y)) {
        if (board[x + 1][y] > 0) {
            count = count + 1;
        }
    }

    //Move north east
    if (isValidMove(x + 1, y - 1)) {
        if (board[x + 1][y - 1] > 0) {
            count = count + 1;
        }
    }

    //Move south east
    if (isValidMove(x + 1, y + 1)) {
        if (board[x + 1][y + 1] > 0) {
            count = count + 1;
        }
    }

    //Move south west
    if (isValidMove(x - 1, y + 1)) {
        if (board[x - 1][y + 1] > 0) {
            count = count + 1;
        }
    }

    //Move north west
    if (isValidMove(x - 1, y - 1)) {
        if (board[x - 1][y - 1] > 0) {
            count = count + 1;
        }
    }

    //console.log(count);

    return count; 
}

function isValidMove(x, y) {
    return (x >= 0) && (y >= 0) && (x < WIDTH) && (y < HEIGHT);
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


