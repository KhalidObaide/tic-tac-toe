const APP = document.querySelector("#app");

/* Global Variables */
const player1 = 'X';
const player2 = 'O'; // CPU by default
let turn = player1;
let originalBoard;
let gameover = false;
const isBotPlaying = true;
const minmaxDepth = 100;
let cellsDOM = [];

function displayModal(text){
    const modal = document.createElement("div");
    modal.setAttribute("class", "modal");

    if(text == "TIE"){
        modal.innerText = "It's a DRAW!";
    }else if(text == player1){
        modal.innerText = "It's Impossible, YOU WON";
    }else if(text == player2){
        modal.innerText = "As always, YOU LOSED!";
    }else{
        modal.innerText = "The winner is " + text;
    }

    const retryButton = document.createElement("button");
    retryButton.setAttribute("class", "retry");
    retryButton.innerText = "Retry";
    retryButton.addEventListener("click",()=>{
        setupBoard();
    });
    modal.appendChild(retryButton);
    APP.appendChild(modal);
    gameover = true;
}

function drawTable(width, height){
    const table = document.createElement("table");
    let i = 0;
    for(let y=0; y<height; y++){
        const row = document.createElement("tr");
        for(let x=0; x<width; x++){
            const cell = document.createElement("td");
            cell.setAttribute("id", i.toString());
            row.appendChild(cell);
            i++;
        }
        table.appendChild(row);
    }
    APP.appendChild(table);
}

function setupBoard(){
    // Remove the modal and the table
    try{APP.querySelector(".modal").remove();}catch(e){}
    try{APP.querySelector("table").remove();}catch(e){}

    gameover = false;
    turn = player1;

    // Brand new table
    drawTable(3, 3);
    originalBoard = Array.from(Array(9).keys());
    cellsDOM = [...document.querySelectorAll("td")];
    cellsDOM.forEach(cell => {
        cell.addEventListener("click", e=>{
            if(!isBotPlaying || (isBotPlaying && turn == player1)){
                const click = handleClick(cell);
                if(click) displayModal(click); // Means if there is a TIE or a winner

                // Bot Turn After Each Click
                if(isBotPlaying){
                    const click = handleTurn(botTurn());
                    if(click) displayModal(click); // Means if there is a TIE or a winner
                }
            }
        });
    });
}

function isCellEmpty(cell, board=originalBoard){
    return typeof(board[cell]) == 'number';
}

function getEmptyCells(board=originalBoard){
    return board.filter(cell => isCellEmpty(cell));
}

function TieGame(board=originalBoard){
    for(let i=0; i<board.length; i++){
        if(isCellEmpty(i, board)) return false;
    }
    return true;
}

function winner(board=originalBoard){
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let win = false;
    winCombos.forEach(combo => {
        const o = board[combo[0]];
        if(board[combo[1]] == o && board[combo[2]] == o){
            win = o;
            return;
        }
    });
    return win;
}

function handleClick(cell){
    if(!gameover){
        return handleTurn(parseInt(cell.id));
    }else{
        return false;
    }
}

function handleTurn(cell){
    if(gameover) return false;
    if(isCellEmpty(cell)){
        cellsDOM[cell].innerText = turn;
        originalBoard[cell] = turn;
        turn = (turn == player1) ? player2 : player1;

        if(winner()) return winner();
        if(TieGame()) return "TIE";

        return false;
    }
}

function botTurn(){
    return minmax(originalBoard, player2, minmaxDepth).index;
}


/* Main minmax Algo goes here */
function minmax(newBoard, player, depth){
    const availSpots = getEmptyCells(newBoard);

    // Terminal Case/Base
    if(depth == 0 || (winner(newBoard) || TieGame(newBoard))){
        if(winner(newBoard)){
            if(winner(newBoard) == player1) return {score: -10}
            if(winner(newBoard) == player2) return {score: 10}
        }else if(TieGame(newBoard)) return {score: 0}
    }


    let moves = [];
    for(let i=0; i<availSpots.length; i++){
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if(player == player2){
            const res = minmax(newBoard, player1, depth-1);
            move.score = res.score;
        }else{
            const res = minmax(newBoard, player2, depth-1);
            move.score = res.score;
        }


        newBoard[availSpots[i]] = move.index;
        moves.push(move);
    }


    let bestMove;
    if(player === player2){
        let bestScore = -10000;
        for(let i=0; i<moves.length; i++){
            if(moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }else{
        let bestScore = 10000;
        for(let i=0; i<moves.length; i++){
            if(moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

setupBoard();
