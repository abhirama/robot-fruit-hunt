function new_game() {
}

function make_move() {
    var board = get_board();


    //debugger;

    // we found an item! take it!
    var roboX = get_my_x();
    var roboY = get_my_y();
    if (board[roboX][roboY] > 0) {
       return TAKE;
    }

    var moves = getMoves(new Node(roboX, roboY));
    moves = filterMoves(moves);
    sortMoves(moves);

    var bestMove = decideBestMove(moves);

    if (bestMove) {
        return bestMove.direction;
    }

    return PASS;
}

function filterMoves(moves) {
	//Ignore fruits which do not improve our chance of winning
	var fruitsOfInterest = getFruitsOfInterest();
	var filteredMoves = [];
	var move;
	for (var i = 0; i < moves.length; ++i) {
		move = moves[i];
		if (fruitsOfInterest[move.destinationFruitType]) {
			filteredMoves.push(move);
		}
	}

	return filteredMoves;
}

function decideBestMove(sortedMyMoves) {
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
        //console.log('Sorted my moves');
        //console.dir(sortedMyMoves);

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

        //console.log('Same distance moves');
        //console.dir(sameDistanceMoves);

        //Find the move which has the maximum no of sorrounding fruits.
        var sorroundingMoveCounts = [];
        for (var index = 0; index < sameDistanceMoves.length; ++index) {
            var move = sameDistanceMoves[index];
            sorroundingMoveCounts.push(new MoveSourroundingCountVO(move, getSorroundingCount(move.destinationNode, false)));    
        }

        sortSorroundingMoveCouts(sorroundingMoveCounts);
        sorroundingMoveCounts = getConnectedSorroundingMoveCounts(sorroundingMoveCounts);

        //console.log('Sorrounding move counts');
        //console.dir(sorroundingMoveCounts);
        return sorroundingMoveCounts[0].move;
    } else {
        if (sortedMyMoves.length) {
            return sortedMyMoves[0];
        }

        return [];
    }
}

function sortSorroundingMoveCouts(sorroundingMoveCounts) {
    sorroundingMoveCounts.sort(function(s0, s1){
            return s1.count - s0.count;
            });
}

function getConnectedSorroundingMoveCounts(sorroundingMoveCounts) {
	var sorroundingMoveCount;
	var count;
	for (var i = 0; i < sorroundingMoveCounts.length; ++i) {
		sorroundingMoveCount = sorroundingMoveCounts[i];
		count = getSorroundingCount(sorroundingMoveCount.move.destinationNode, true);
		sorroundingMoveCount.count = count;
	}

	sortSorroundingMoveCouts(sorroundingMoveCounts);

	return sorroundingMoveCounts;
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

function getFruitsOfInterest() {
	var all = get_number_of_item_types();
	//console.log('All fruits:' + all);

	fruitsOfInterest = {};

    /*
	for (var type = 1; type <= all; ++type) {
		//console.log('Type:' + (type + 1) + ', Count:' + get_total_item_count(type + 1));
        if (doesOpponentWin(type)) {
			fruitsOfInterest[type] = 1;
        }
	}

    //Pseudo length check ;)
    for (var key in fruitsOfInterest) {
        //There is a fruit which if the opponent picks he wins aim to pick that fruit first
        console.dir(fruitsOfInterest);
        debugger;
        return fruitsOfInterest;
    }*/

	for (var type = 1; type <= all; ++type) {
		//console.log('Type:' + (type + 1) + ', Count:' + get_total_item_count(type + 1));
		if (shouldPickThisFruit(type)) {
			fruitsOfInterest[type] = 1;
		} else {
			//console.log('Discard fruit of type ' + fruitType + '. Total count:' + get_total_item_count(fruitType));
			//debugger;
		}
	}

	return fruitsOfInterest;
}

function shouldPickThisFruit(fruitType) {
	//Pick the fruit only if we have the chance of gathering more than the opponent
	var total = get_total_item_count(fruitType);
	var myCount = get_my_item_count(fruitType);
	var opponentCount = get_opponent_item_count(fruitType);

	//We have more than enough to win
	if (myCount > (total / 2)) {
		return false;
	}

	//We do not have a chance of maxing this fruit category 
	if (opponentCount > (total / 2)) {
		return false;
	}

	if (myCount == (total / 2)) {
		if (opponentCount != (total / 2)) {
			//We have a chance to max this category
			return true;
		} else {
			return false;
		}
	}

	return true;
}

function Node(x, y) {
    this.x = x;
    this.y = y;

    var that = this;

    this.equal = function(node) {
        return (that.x == node.x) && (that.y == node.y);
    }
}

function Move(destinationNode, destinationFruitType, direction, distance) {
    this.destinationNode = destinationNode;
    this.destinationFruitType = destinationFruitType; 
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
    return new Move(fruitNode, get_board()[fruitNode.x][fruitNode.y], direction, distance);
}

function getSorroundingCount(node, onlyConnectingOnes) {
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

    if (!onlyConnectingOnes) {
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
    }

    //console.log(count);

    return count; 
}

function isValidMove(x, y) {
    return (x >= 0) && (y >= 0) && (x < WIDTH) && (y < HEIGHT);
}

function doesOpponentWin(fruitType) {
    //At this point in the game, if the opponent picks a fruit of this type, does he win?
	var all = get_number_of_item_types();

    var myScore = 0;
    var opponentScore = 0;

	for (var type = 1; type <= all; ++type) {
        var total = get_total_item_count(type);
        var myCount = get_my_item_count(type);
        var opponentCount = get_opponent_item_count(type);

        if (fruitType == type) {
            opponentCount = opponentCount + 1;
        }

        if (myCount > opponentCount) {
            myScore = myScore + 1;
        }

        if (myCount < opponentCount) {
            opponentScore = opponentScore + 1;
        }

        if (myCount == opponentCount) {
            myScore = myScore + 1;
            opponentScore = opponentScore + 1;
        }
	}

    return opponentScore > myScore;
}
