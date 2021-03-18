const ELEMS = {
    body: document.body,
    gameboard: document.getElementById("gameboard"),
    cells: document.querySelectorAll(".gameboard .cell"),
    nameDisplay: {
        x: document.querySelector(".player.x span"),
        o: document.querySelector(".player.o span"),
    },
    restartBtn: document.querySelector("#restart-btn"),
    settingsBtn: document.querySelector("#settings-btn"),
    
    playersSettings: {
        x: {
            self: document.querySelector(".settings-screen .x"),
            type: document.querySelectorAll('input[name="x-type"'),
            name: document.querySelector('input[name="x-name"'),
            level: document.querySelectorAll('input[name="x-level"'),
        },
        o: {
            self: document.querySelector(".settings-screen .o"),
            type: document.querySelectorAll('input[name="o-type"'),
            name: document.querySelector('input[name="o-name"'),
            level: document.querySelectorAll('input[name="o-level"'),
        },
    },
    messageBox: document.querySelector(".screen.message-screen h1"),
}

ELEMS.restartBtn.addEventListener("click", function restart(){
    thisGame = newGame();
});
ELEMS.settingsBtn.addEventListener("click", function displaySettings(e){
    ELEMS.body.classList.add("settings")
})
{
    let a = ["x", "o"]
    a.forEach(x=>{
        ELEMS.playersSettings[x]["type"][0].addEventListener("change", function displayNameInput(){
            ELEMS.playersSettings[x].self.classList.remove("computer");
            ELEMS.playersSettings[x].self.classList.add("human");
        })

        ELEMS.playersSettings[x]["type"][1].addEventListener("change", function displayNameInput(){
            ELEMS.playersSettings[x].self.classList.remove("human");
            ELEMS.playersSettings[x].self.classList.add("computer");
        })
    })
}

var thisGame = newGame();

function newGame(){
    ELEMS.body.classList.remove("settings");
    ELEMS.body.classList.remove("message");
    ELEMS.body.classList.remove("o");
    ELEMS.body.classList.add("x");

    resetGameboard();

    let boardInfo={};
    boardInfo.cellStatus = [
        null, null, null,
        null, null, null,
        null, null, null,
    ];
    boardInfo.emptyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    let currPlayer = "x";//  Player with current turn
    let playersInfo={
        x: {},
        o: {},
    };
    for(let i in ELEMS.playersSettings){
        let playerType
        ELEMS.playersSettings[i]["type"].forEach(e=>{
            if(e.checked === true){
                playerType = e.value;
            }
        })
        playersInfo[i]["type"] = playerType;

        if(playerType === "human"){
            playersInfo[i]["name"] = ELEMS.playersSettings[i]["name"].value || "Human"
        } else {
            let playerLevel;
            ELEMS.playersSettings[i]["level"].forEach(e=>{
                if(e.checked === true){
                    playerLevel = e.value;
                }
            })
            playersInfo[i]["level"] = playerLevel;
            playersInfo[i]["name"] = playerLevel;

            playersInfo[i]["algorithm"] = getAlgorithm(playerLevel, i);
        }
    }

    ELEMS.nameDisplay.x.innerText = playersInfo.x.name;
    ELEMS.nameDisplay.o.innerText = playersInfo.o.name;

    if(playersInfo[currPlayer].type === "computer"){
        setTimeout(playersInfo[currPlayer].algorithm);
    }

    return {play, getBoardInfo};

    function getBoardInfo(){return boardInfo}

    function play(cellNo, playerType = "human"){
        if(boardInfo.cellStatus[cellNo] || playerType !== playersInfo[currPlayer]["type"]){
            return;
        }

        boardInfo.cellStatus[cellNo] = currPlayer;
        boardInfo.emptyCells = boardInfo.emptyCells.filter(e=>e!==cellNo);
        ELEMS.cells[cellNo].classList.add(currPlayer);

        if(checkForWin(boardInfo.cellStatus, currPlayer)){
            displayMessage(`${currPlayer.toUpperCase()}'s Win`);
            return
        }else if(boardInfo.emptyCells.length === 0){
            displayMessage("Draw");
            return
        }

        changePlayer();

        if(playersInfo[currPlayer].type === "computer"){
            setTimeout(playersInfo[currPlayer].algorithm);
        }
    }
    function changePlayer(){
        ELEMS.body.classList.remove(currPlayer);
        currPlayer = currPlayer === "x"? "o" : "x"
        ELEMS.body.classList.add(currPlayer);
    }
}


function resetGameboard(){
    for(let i = 0; i < 9; i++){
        ELEMS.cells[i].className = "cell";
        ELEMS.cells[i].addEventListener("click", function cellClicked(){
            thisGame.play(i);
        })
    }
}
function checkForWin(cellStatus, player = null){
    const winComb = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],// rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],// columns
        [0, 4, 8], [2, 4, 6]// diagonals
    ]
    if(player){
        return winComb.some(arr=>arr.every(e=>cellStatus[e]===player));
    } else if(checkForWin(cellStatus, "x")) {
        return true;
    } else {
        return checkForWin(cellStatus, "o");
    }
}
function displayMessage(message){
    ELEMS.messageBox.innerText = message;
    ELEMS.body.classList.add("message");
}

function getAlgorithm(level, player){
    let boardInfo;
    let playLocation;
    const ALGORITHMS = {
        easy: function(){
            boardInfo = thisGame.getBoardInfo();
            playLocation = chooseRandomEmptyCell();
            play(playLocation);
        },
        medium: function(){
            boardInfo = thisGame.getBoardInfo();
            playLocation = chooseRandomEmptyCell();
            
            let cellStatus = [...boardInfo.cellStatus];
            let emptyCells = [...boardInfo.emptyCells];
            let len = emptyCells.length;

            let nextPlayer = player === "x"? "o": "x";
            for(let i = 0; i < len; i++){
                let index = emptyCells[i];

                cellStatus[index] = player;
                if(checkForWin(cellStatus, player)){
                    playLocation = index;
                    break;
                }

                cellStatus[index] = nextPlayer;
                if(checkForWin(cellStatus, nextPlayer)){
                    playLocation = index;
                }

                cellStatus[index] = null;
            }

            play(playLocation);
        },
        hard: function(){
            boardInfo = thisGame.getBoardInfo();

            playLocation = bestMove(boardInfo, player)[0];

            play(playLocation);
        }

    }
    return ALGORITHMS[level];
    function chooseRandomEmptyCell(){
        let len = boardInfo.emptyCells.length;
        let rnd = Math.floor(Math.random()*len);
        return boardInfo.emptyCells[rnd]
    }
    function play(location){
        setTimeout(function(){thisGame.play(location, "computer")}, 1000)
    }
    function bestMove({cellStatus:[...cellStatus], emptyCells:[...emptyCells]}, player, depth = 0){
        let returnArr = [null, -Infinity];
        let nextPlayer = player==="x" ? "o" : "x"
    
        let len = emptyCells.length;
        for(let i=0; i<len; i++){
            let index = emptyCells.splice(i, 1)[0];
            cellStatus[index] = player;
    
            if(checkForWin(cellStatus, player)){
                return [index, 10-depth];
            } else if(len === 1){
                return [index, 0];
            } else {
                let value = -bestMove({cellStatus, emptyCells}, nextPlayer, depth+1)[1];
    
                if(value > returnArr[1] || (value === returnArr[1] && Math.random()>0.5)){
                    returnArr = [index, value];
                }
            }
    
            cellStatus[index] = null;
            emptyCells.splice(i, 0, index);
        }
        
        return returnArr;
    }
}