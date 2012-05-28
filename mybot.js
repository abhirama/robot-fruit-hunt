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

    //North count
    var northCount = 0;
    if (isValidMove(x, y - 1)) {
        northCount = getSorroundingCount(x, y - 1);    
    }
        
    //South count
    var southCount = 0;
    if (isValidMove(x, y + 1)) {
        southCount = getSorroundingCount(x, y + 1);    
    }

    //West count
    var westCount = 0 
    if (isValidMove(x - 1, y)) {
        westCount = getSorroundingCount(x - 1, y);    
    }

    //East count
    var eastCount = 0;
    if (isValidMove(x + 1, y)) {
        eastCount = getSorroundingCount(x + 1, y);    
    }

    var largest = [northCount, southCount, westCount, eastCount].sort()[3];

    if (largest == northCount) {
        return NORTH;
    }

    if (largest == southCount) {
        return SOUTH;
    }

    if (largest == westCount) {
        return WEST;
    }

    if (largest == eastCount) {
        return EAST;
    }

    return PASS;
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


