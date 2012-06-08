function new_game() {
}

var MyBot = {
    update: function(){
        MyBot.board = get_board();

        console.dir(MyBot.board);

        MyBot.position = new Node(get_my_x(), get_my_y());
        console.log('MyBot.position');
        console.dir(MyBot.position);
        MyBot.opponentPosition = new Node(get_opponent_x(), get_opponent_y());
        console.log('MyBot.opponentPosition');
        console.dir(MyBot.opponentPosition);

        MyBot.allFruitTypes = MyBot.getAllFruitTypes();
        console.log('MyBot.allFruitTypes');
        console.dir(MyBot.allFruitTypes);

        MyBot.pickFruitTypesDict = MyBot.convertToDict(MyBot.getPickFruitTypes());
        console.log('MyBot.pickFruitTypesDict');
        console.dir(MyBot.pickFruitTypesDict);

        MyBot.pickFruitNodes = MyBot.getPickFruitNodes(MyBot.pickFruitTypesDict);
        console.log('MyBot.pickFruitNodes');
        console.dir(MyBot.pickFruitNodes);

        MyBot.nodeMovesMap = MyBot.getNodeMovesMap(MyBot.position);
        console.log('MyBot.nodeMovesMap');
        console.dir(MyBot.nodeMovesMap);
        MyBot.opponentNodeMovesMap = MyBot.getNodeMovesMap(MyBot.opponentPosition);
        console.log('MyBot.opponentNodeMovesMap');
        console.dir(MyBot.opponentNodeMovesMap);

        MyBot.sortedMoves = MyBot.sortMoves(MyBot.getMoves(MyBot.nodeMovesMap)); //Move to nearest fruit node first
        console.log('MyBot.sortedMoves');
        console.dir(MyBot.sortedMoves);
        MyBot.sortedOpponentMoves = MyBot.sortMoves(MyBot.getMoves(MyBot.opponentNodeMovesMap)); //Move to nearest fruit node first
        console.log('MyBot.sortedOpponentMoves');
        console.dir(MyBot.sortedOpponentMoves);

        MyBot.sameDistanceMoves = MyBot.getSameDistanceMoves(MyBot.sortedMoves); //Grouping of moves which have the same distance to fruit nodes
        console.log('MyBot.sameDistanceMoves');
        console.dir(MyBot.sameDistanceMoves);
        MyBot.opponentSameDistanceMoves = MyBot.getSameDistanceMoves(MyBot.sortedOpponentMoves); //Grouping of moves which have the same distance to fruit nodes
        console.log('MyBot.opponentSameDistanceMoves');
        console.dir(MyBot.opponentSameDistanceMoves);

        MyBot.sortedMoveSorroundingCountVOs = MyBot.sortMoveSorroundingCountVOs(MyBot.getMoveSorroundingCountVOs(MyBot.sortedMoves, false));
        console.log('MyBot.sortedMoveSorroundingCountVOs');
        console.dir(MyBot.sortedMoveSorroundingCountVOs);

        MyBot.moveSorroundingCountVOsDict = MyBot.getMoveSorroundingCountVOsDict(MyBot.sortedMoveSorroundingCountVOs);
        console.log('MyBot.moveSorroundingCountVOsDict');
        console.dir(MyBot.moveSorroundingCountVOsDict);

        MyBot.moveConnectedSorroundingCountVOs = MyBot.getMoveSorroundingCountVOs(MyBot.sortedMoves, true);
        console.log('MyBot.moveConnectedSorroundingCountVOs');
        console.dir(MyBot.moveConnectedSorroundingCountVOs);

        MyBot.moveConnectedSorroundingCountVOsDict = MyBot.getMoveSorroundingCountVOsDict(MyBot.moveConnectedSorroundingCountVOs);
        console.log('MyBot.moveConnectedSorroundingCountVOsDict');
        console.dir(MyBot.moveConnectedSorroundingCountVOsDict);
    },

    getBestMove: function(sortedMoves){
        if (sortedMoves.length <= 1) {
            if (!sortedMoves.length) {
                return PASS;
            }
            return sortedMoves[0].direction;
        }

        var leastDistance = sortedMoves[0].distance; 
        var leastDistanceMoves = MyBot.sameDistanceMoves[leastDistance]; //All moves which have the least distance to a fruit


        var moveSorroundingCountVOs = [];

        var len = leastDistanceMoves.length;
        var move;
        var i;
        //Get all sorrounding count vos corresponding to the smallest distance
        for (i = 0; i < len; ++i) {
            move = leastDistanceMoves[i];
            moveSorroundingCountVOs.push(MyBot.moveSorroundingCountVOsDict[MyBot.getMapKeyFromNode(move.destinationNode)]);    
        }


        //Sort them based on their sourrounding fruit count
        var sortedMoveSorroundingCountVOs = MyBot.sortMoveSorroundingCountVOs(moveSorroundingCountVOs);


        len = sortedMoveSorroundingCountVOs.length;
        var sameCountMoveSorroundingCountVOs = [];
        var maxCount = sortedMoveSorroundingCountVOs[0].count;
        var moveSorroundingCountVO;
        //Get all sorrounding count vos corresponding to the maximum count
        for (i = 0; i < len; ++i) {
            moveSorroundingCountVO = sortedMoveSorroundingCountVOs[i];    

            if (moveSorroundingCountVO.count != maxCount) {
                break;
            }

            sameCountMoveSorroundingCountVOs.push(moveSorroundingCountVO);
        }

        var moveConnectedSorroundingCountVOs = [];

        len = sameCountMoveSorroundingCountVOs.length;
        var moveConnectedSorroundingCountVO;
        //Reduce move sorrounding count vos to connected move sorrounding count vos
        for (i = 0; i < len; ++i) {
            moveConnectedSorroundingCountVO = sameCountMoveSorroundingCountVOs[i];
            moveConnectedSorroundingCountVOs.push(MyBot.moveConnectedSorroundingCountVOsDict[MyBot.getMapKeyFromNode(moveConnectedSorroundingCountVO.move.destinationNode)]);
        }

        //Sort based on their count
        MyBot.sortMoveSorroundingCountVOs(moveConnectedSorroundingCountVOs);

        len = moveConnectedSorroundingCountVOs.length;
        for (i = 0; i < len; ++i) {
            moveConnectedSorroundingCountVO = moveConnectedSorroundingCountVOs[i];

            //The opponent bot is closer to this fruit than us, hence skip it.
            if (!MyBot.isOpponentNearer(moveConnectedSorroundingCountVO.move.destinationNode, moveConnectedSorroundingCountVO.move.distance)) {
                console.dir(moveConnectedSorroundingCountVO);
                return moveConnectedSorroundingCountVO.move.direction;
            }
        }

        return MyBot.getBestMove(sortedMoves.splice(1, sortedMoves.length - 1));
    },

    getAllFruitTypes: function() {
        var total = get_number_of_item_types();
        var all = [];

        for (var type = 1; type <= total; ++type) {
            all.push(type);
        }

        return all;
    },

    getPickFruitTypes: function() {
        var len = MyBot.allFruitTypes.length;
        var type;
        var shouldPick = [];
        for (var i = 0; i < len; ++i) {
            type = MyBot.allFruitTypes[i];    
            if (MyBot.shouldPickThisFruit(type)) {
                shouldPick.push(type);
            }
        }

        return shouldPick;
    },

    shouldPickThisFruit: function(fruitType) {
        //Pick this fruit only if we have the chance of gathering more than the opponent
        var total = get_total_item_count(fruitType);
        var myCount = get_my_item_count(fruitType);
        var opponentCount = get_opponent_item_count(fruitType);

        //We have more than enough to win
        if (myCount > (total / 2)) {
            return false;
        }

        //We do not have a chance of maxing this fruit category, hence do not waste a move picking it
        if (opponentCount > (total / 2)) {
            return false;
        }

        if (myCount == (total / 2)) {
            if (opponentCount != (total / 2)) {
                //We have a chance to max this category, hence pick this fruit
                return true;
            } else {
                return false;
            }
        }

        return true;
    },

    getPickFruitNodes: function(pickFruitTypesDict) {
        var nodes = [];    
        
        for (var x = 0; x < WIDTH; ++x) {
            for (var y = 0; y < HEIGHT; ++y) {
                if (MyBot.board[x][y] > 0) {
                    if (pickFruitTypesDict[MyBot.board[x][y]]) {
                        nodes.push(new Node(x, y));
                    }
                }
            }
        }

        return nodes;
    },

    getNodeMovesMap: function(botNode) {
        var len = MyBot.pickFruitNodes.length;
        var fruitNode;
        var move;
        var nodeMovesMap = {};
        for (var i = 0; i < len; ++i) {
            fruitNode = MyBot.pickFruitNodes[i];    
            move = MyBot.getMove(botNode, fruitNode); 
            nodeMovesMap[MyBot.getMapKeyFromNode(fruitNode)] = move;
        }

        return nodeMovesMap;
    },

    getMove: function (roboNode, fruitNode) {
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
        return new Move(fruitNode, MyBot.board[fruitNode.x][fruitNode.y], direction, distance);
    },

    getMoves: function(nodeMovesMap) {
        var moves = [];
        for (var key in nodeMovesMap) {
            moves.push(nodeMovesMap[key]);
        }

        return moves;
    },

    sortMoves: function(moves) {
        moves.sort(function(move0, move1){
            var dist0 = move0.distance;
            var dist1 = move1.distance;
            if (dist0 < dist1)
                return -1;
            if (dist0 > dist1)
                return 1;
            return 0;
        });

        return moves;
    },

    getSameDistanceMoves: function(moves) {
        //Return format {distance => [move]}
        var len = moves.length;
        var move;
        var sameDistanceMoves = {};
        for (var i = 0; i < len; ++i) {
            move = moves[i];    
            if (!sameDistanceMoves[move.distance]) {
                sameDistanceMoves[move.distance] = []
            }

            sameDistanceMoves[move.distance].push(move);
        }

        return sameDistanceMoves;
    },

    getMoveSorroundingCountVOs: function(moves, onlyConnecting) {
            var vos = [];
            var len = moves.length;
            var move;
            for (var i = 0; i < len; ++i) {
                move = moves[i];
                vos.push(new MoveSourroundingCountVO(move, MyBot.getSorroundingCount(move.destinationNode, onlyConnecting)));
            }
            return vos;
    },

    getMoveSorroundingCountVOsDict: function(moveConnectedSorroundingCountVOs) {
        var len = moveConnectedSorroundingCountVOs.length;
        
        var vos = {};

        var vo;
        for (var i = 0; i < len; ++i) {
            vo = moveConnectedSorroundingCountVOs[i];    
            vos[MyBot.getMapKeyFromNode(vo.move.destinationNode)] = vo;
        }

        return vos;
    },

    getMapKeyFromNode: function(node) {
        return node.x + ':' + node.y;
    },

    convertToDict: function(ary) {
        var dict = {};
        var len = ary.length;
        for (var i = 0; i < len; ++i) {
            dict[ary[i]] = 1;
        }

        return dict;
    },

    getSorroundingCount: function(node, onlyConnectingOnes) {
        //console.dir(node);
        var x = node.x, y = node.y;

        var board = MyBot.board;
        var count = 0;

        //Move north            
        if (MyBot.isValidMove(x, y - 1)) {
            if (MyBot.pickFruitTypesDict[MyBot.board[x][y - 1]]) {
                count = count + 1;
            }
        }

        //Move south
        if (MyBot.isValidMove(x, y + 1)) {
            if (MyBot.pickFruitTypesDict[MyBot.board[x][y + 1]]) {
                count = count + 1;
            }
        }

        //Move west 
        if (MyBot.isValidMove(x - 1, y)) {
            if (MyBot.pickFruitTypesDict[MyBot.board[x - 1][y]]) {
                count = count + 1;
            }
        }

        //Move east
        if (MyBot.isValidMove(x + 1, y)) {
            if (MyBot.pickFruitTypesDict[MyBot.board[x + 1][y]]) {
                count = count + 1;
            }
        }

        if (!onlyConnectingOnes) {
            //Move north east
            if (MyBot.isValidMove(x + 1, y - 1)) {
                if (MyBot.pickFruitTypesDict[MyBot.board[x + 1][y - 1]]) {
                    count = count + 1;
                }
            }

            //Move south east
            if (MyBot.isValidMove(x + 1, y + 1)) {
                if (MyBot.pickFruitTypesDict[MyBot.board[x + 1][y + 1]]) {
                    count = count + 1;
                }
            }

            //Move south west
            if (MyBot.isValidMove(x - 1, y + 1)) {
                if (MyBot.pickFruitTypesDict[MyBot.board[x - 1][y + 1]]) {
                    count = count + 1;
                }
            }

            //Move north west
            if (MyBot.isValidMove(x - 1, y - 1)) {
                if (MyBot.pickFruitTypesDict[MyBot.board[x - 1][y - 1]]) {
                    count = count + 1;
                }
            }
        }

        //console.log(count);

        return count; 
    },
    
    isValidMove: function(x, y) {
        return (x >= 0) && (y >= 0) && (x < WIDTH) && (y < HEIGHT);
    },

    sortMoveSorroundingCountVOs: function(sorroundingMoveCounts) {
        sorroundingMoveCounts.sort(function(s0, s1){
            return s1.count - s0.count;
        });

        return sorroundingMoveCounts;
    },

    isOpponentNearer: function(fruitNode, myMoveCount) {
        var fruitX = fruitNode.x, fruitY = fruitNode.y;

        var opponentMoves = MyBot.getMove(MyBot.opponentPosition, new Node(fruitX, fruitY)).distance;

        //console.log('opponent moves:' + opponentMoves + ', my moves:' + myMoveCount);
        return opponentMoves < myMoveCount;
    }

};

function make_move() {
    MyBot.update();

    if (MyBot.pickFruitTypesDict[MyBot.board[MyBot.position.x][MyBot.position.y]]) {
        return TAKE;
    }

    return MyBot.getBestMove(MyBot.sortedMoves);
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
        var bestMove = sorroundingMoveCounts[0].move;
        //Remove this best node and run the method logic again
        if (isOpponentNearer(bestMove.destinationNode, bestMove.distance)) {
            //console.dir(bestMove.destinationNode);
            //debugger;
            var _sortedMyMoves = [];     
            for (var i = 0; i < sortedMyMoves.length; ++i) {
                var sortedMyMove = sortedMyMoves[i];
                if (!sortedMyMove.destinationNode.equal(bestMove.destinationNode)) {
                    _sortedMyMoves.push(sortedMyMove);    
                }
            }

            return decideBestMove(_sortedMyMoves);
        } else {
            return bestMove;
        }
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
        var dist0 = move0.distance;
        var dist1 = move1.distance;

        if (dist0 < dist1)
            return -1;
        if (dist0 > dist1)
            return 1;
        return 0;
    });

    return moves;
}

function isOpponentNearer(fruitNode, myMoveCount) {
    var fruitX = fruitNode.x, fruitY = fruitNode.y;
    var x = get_opponent_x();    
    var y = get_opponent_y();    

    var opponentMoves = getMove(new Node(x, y), new Node(fruitX, fruitY)).distance;

    //console.log('opponent moves:' + opponentMoves + ', my moves:' + myMoveCount);
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
