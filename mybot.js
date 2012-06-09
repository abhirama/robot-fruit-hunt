function new_game() {
}

var MyBot = {
    update: function(){
        MyBot.board = get_board();

        //console.dir(MyBot.board);

        MyBot.position = new Node(get_my_x(), get_my_y());
        //console.log('MyBot.position');
        //console.dir(MyBot.position);
        MyBot.opponentPosition = new Node(get_opponent_x(), get_opponent_y());
        //console.log('MyBot.opponentPosition');
        //console.dir(MyBot.opponentPosition);

        MyBot.allFruitTypes = MyBot.getAllFruitTypes();
        //console.log('MyBot.allFruitTypes');
        //console.dir(MyBot.allFruitTypes);

        MyBot.pickFruitTypesDict = MyBot.convertToDict(MyBot.getPickFruitTypes());
        //console.log('MyBot.pickFruitTypesDict');
        //console.dir(MyBot.pickFruitTypesDict);

        MyBot.fruitNodes = MyBot.getFruitNodes();

        MyBot.pickFruitNodes = MyBot.getPickFruitNodes(MyBot.pickFruitTypesDict);
        //console.log('MyBot.pickFruitNodes');
        //console.dir(MyBot.pickFruitNodes);

        MyBot.nodeMovesMap = MyBot.getNodeMovesMap(MyBot.position, MyBot.pickFruitNodes);
        //console.log('MyBot.nodeMovesMap');
        //console.dir(MyBot.nodeMovesMap);
        MyBot.opponentNodeMovesMap = MyBot.getNodeMovesMap(MyBot.opponentPosition, MyBot.fruitNodes);
        //console.log('MyBot.opponentNodeMovesMap');
        //console.dir(MyBot.opponentNodeMovesMap);

        MyBot.sortedMoves = MyBot.sortMoves(MyBot.getMoves(MyBot.nodeMovesMap)); //Move to nearest fruit node first
        //console.log('MyBot.sortedMoves');
        //console.dir(MyBot.sortedMoves);
        MyBot.sortedOpponentMoves = MyBot.sortMoves(MyBot.getMoves(MyBot.opponentNodeMovesMap)); //Move to nearest fruit node first
        //console.log('MyBot.sortedOpponentMoves');
        //console.dir(MyBot.sortedOpponentMoves);

        MyBot.sameDistanceMoves = MyBot.getSameDistanceMoves(MyBot.sortedMoves); //Grouping of moves which have the same distance to fruit nodes
        //console.log('MyBot.sameDistanceMoves');
        //console.dir(MyBot.sameDistanceMoves);
        MyBot.opponentSameDistanceMoves = MyBot.getSameDistanceMoves(MyBot.sortedOpponentMoves); //Grouping of moves which have the same distance to fruit nodes
        //console.log('MyBot.opponentSameDistanceMoves');
        //console.dir(MyBot.opponentSameDistanceMoves);

        MyBot.sortedMoveSorroundingCountVOs = MyBot.sortMoveSorroundingCountVOs(MyBot.getMoveSorroundingCountVOs(MyBot.sortedMoves, false));
        //console.log('MyBot.sortedMoveSorroundingCountVOs');
        //console.dir(MyBot.sortedMoveSorroundingCountVOs);

        MyBot.moveSorroundingCountVOsDict = MyBot.getMoveSorroundingCountVOsDict(MyBot.sortedMoveSorroundingCountVOs);
        //console.log('MyBot.moveSorroundingCountVOsDict');
        //console.dir(MyBot.moveSorroundingCountVOsDict);

        MyBot.moveConnectedSorroundingCountVOs = MyBot.getMoveSorroundingCountVOs(MyBot.sortedMoves, true);
        //console.log('MyBot.moveConnectedSorroundingCountVOs');
        //console.dir(MyBot.moveConnectedSorroundingCountVOs);

        MyBot.moveConnectedSorroundingCountVOsDict = MyBot.getMoveSorroundingCountVOsDict(MyBot.moveConnectedSorroundingCountVOs);
        //console.log('MyBot.moveConnectedSorroundingCountVOsDict');
        //console.dir(MyBot.moveConnectedSorroundingCountVOsDict);
    },

    getBestMove: function(sortedMoves){
        if (sortedMoves.length <= 1) {
            if (!sortedMoves.length) {
                return PASS;
            }
            return sortedMoves[0].direction;
        }

        //If there is not even a single fruit to which we are closer than the opponent, then move to the fruit which is furthest from the opponent
        /*
        if (!MyBot.isAtLeastOneFruitCloser()) {
            MyBot.getMove(MyBot.position, MyBot.sortedOpponentMoves[MyBot.sortedOpponentMoves.length - 1].destinationNode);
        }*/

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

        var nodeMovesMap;
        var _sortedMoves;
        var selectedMove;
        var _leastDistance = Number.POSITIVE_INFINITY;
        //There are no sorrounding fruits
        if (sortedMoveSorroundingCountVOs[0].count == 0) {
            for (i = 0; i < len; ++i) {
                move = leastDistanceMoves[i];

                nodeMovesMap = MyBot.getNodeMovesMap(move.destinationNode, MyBot.fruitNodes);

                _sortedMoves = MyBot.sortMoves(MyBot.getMoves(nodeMovesMap));

                console.dir(_sortedMoves[0]);

                //Select the node from which the next node is nearest
                if (_sortedMoves.length) {
                    if (_sortedMoves[0].distance < _leastDistance) {
                        selectedMove = move.direction;
                        _leastDistance = _sortedMoves[0].distance;
                    }
                }

            }
        }

        if (_leastDistance != Number.POSITIVE_INFINITY) {
            return selectedMove;
        }


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

            //If we are very close to the fruit make sure that the opponent bot is not nearer. If we are far away from the fruit, calculating the opponent position gives rise
            //to repeated move patterns.
            /*
            if (moveConnectedSorroundingCountVO.move.distance <= 2) {
                //The opponent bot is closer to this fruit than us, hence skip it.
                if (!MyBot.isOpponentNearer(moveConnectedSorroundingCountVO.move.destinationNode, moveConnectedSorroundingCountVO.move.distance)) {
                    //console.dir(moveConnectedSorroundingCountVO);
                    return moveConnectedSorroundingCountVO.move.direction;
                }
            } else {
                return moveConnectedSorroundingCountVO.move.direction;
            }*/

            return moveConnectedSorroundingCountVO.move.direction;
        }

        //Nearest move did not yeild any good moves, hence pop it out of the array and repeat the whole method again
        //return MyBot.getBestMove(sortedMoves.splice(1, sortedMoves.length - 1));
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

    getFruitNodes: function() {
        var nodes = [];    
        
        for (var x = 0; x < WIDTH; ++x) {
            for (var y = 0; y < HEIGHT; ++y) {
                if (MyBot.board[x][y] > 0) {
                    nodes.push(new Node(x, y));
                }
            }
        }

        return nodes;
    },

    getNodeMovesMap: function(botNode, fruitNodes) {
        //Ignores nodes where the botNode is the same as fruitNode
        var len = fruitNodes.length;
        var fruitNode;
        var move;
        var nodeMovesMap = {};
        for (var i = 0; i < len; ++i) {
            fruitNode = fruitNodes[i];    
            if (fruitNode.equal(botNode)) {
                continue;
            }
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

        ////console.log('Distance=' + distance + ', Direction=' + direction);
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
        ////console.dir(node);
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

        ////console.log(count);

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

        ////console.log('opponent moves:' + opponentMoves + ', my moves:' + myMoveCount);
        return opponentMoves < myMoveCount;
    },

    isAtLeastOneFruitCloser: function() {
        var myMove;
        var opMove;
        for (var node in MyBot.nodeMovesMap) {
            myMove = MyBot.nodeMovesMap[node]; 
            opMove = MyBot.opponentNodeMovesMap[node];

            if (myMove.distance <= opMove.distance) {
                return true;
            }
        }

        return false;

    }
};

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

function make_move() {
    MyBot.update();

    if (MyBot.pickFruitTypesDict[MyBot.board[MyBot.position.x][MyBot.position.y]]) {
        return TAKE;
    }

    return MyBot.getBestMove(MyBot.sortedMoves);
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
//function default_board_number() {
//    return 123;
//}
