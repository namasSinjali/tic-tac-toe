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
            type: document.querySelectorAll('input[name="x-type"'),
            name: document.querySelector('input[name="x-name"'),
            level: document.querySelectorAll('input[name="x-level"'),
        },
        o: {
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

var thisGame = newGame();

function newGame(){
    ELEMS.body.classList.remove("settings");
    ELEMS.body.classList.remove("message");
    ELEMS.body.classList.remove("o");
    ELEMS.body.classList.add("x");

    resetGameboard();

    let boardStatus = [
        null, null, null,
        null, null, null,
        null, null, null,
    ];
    let emptyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

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
        }
    }

    ELEMS.nameDisplay.x.innerText = playersInfo.x.name;
    ELEMS.nameDisplay.o.innerText = playersInfo.o.name;

    return {play};

    function play(cellNo){
        if(boardStatus[cellNo]){
            return;
        }

        boardStatus[cellNo] = currPlayer;
        emptyCells = emptyCells.filter(e=>e!==cellNo);
        ELEMS.cells[cellNo].classList.add(currPlayer);

        if(checkForWin(boardStatus, currPlayer)){
            displayMessage(`${currPlayer.toUpperCase()}'s Win`)
        }else if(emptyCells.length === 0){
            displayMessage("Draw");
        }

        changePlayer();
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
        }, {once: true})
    }
}
function checkForWin(boardStatus, player = null){
    const winComb = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],// rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],// columns
        [0, 4, 8], [2, 4, 6]// diagonals
    ]
    if(player){
        return winComb.some(arr=>arr.every(e=>boardStatus[e]===player));
    } else if(checkForWin(boardStatus, "x")) {
        return true;
    } else {
        return checkForWin(boardStatus, "o");
    }
}
function displayMessage(message){
    ELEMS.messageBox.innerText = message;
    ELEMS.body.classList.add("message");
}