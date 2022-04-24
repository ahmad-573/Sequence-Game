// import React, {useState, useCallback} from 'react';
// import ReactDOM from 'react-dom';
//import './sequence.css'

//const { useEffect } = require("react");

//const { WebSocketServer } = require("ws");

const player_names = ["player1", "player2", "player3", "player4","",""]

const ws = new WebSocket(`ws://localhost:8080`);
let diamondSign = "♦";
let heartSign = "♥";
let spadesSign = "♠";
let clubsSign = "♣";
let dict = {"diams": diamondSign, "spades": spadesSign, "clubs": clubsSign, "hearts": heartSign};

function getJack(d){
  for (let card of d){
    if (card.split(" ")[1].substring(5) == "j") return card
  }
  return undefined;
}


const Card = ({setTextbox, turn, username, setTurn, colour, row, column, card, setDeck, deck, setPositionBoard, positionBoard}) => {
  const onClickCard = async e => {
    if (turn == 5) { alert("Game has ended!"); return; }
    if (player_names[turn] != username) alert("This is not your turn!");
    else{
      if (deck.includes(card)){
        let new_deck = [];
        for (let d of deck){
          if (d != card){
            new_deck.push(d)
          }
        }
        setDeck(new_deck)
        ws.send(JSON.stringify({type: "move", row: row, column: column, colour: colour}))
      }
      else{
        let jack = getJack(deck);
        if (jack){
          let res = confirm("Do you want to use you jack?");
          if (res){
            let new_deck = [];
            for (let d of deck){
              if (d != jack){
                new_deck.push(d)
              }
            }
            setDeck(new_deck)
            ws.send(JSON.stringify({type: "move", row: row, column: column, colour: colour}))
          }
        } 
        else alert("Not a valid move");
      }
    }
  }

  ws.onmessage = (ev) => {
    let ev_new = JSON.parse(ev.data)
    let msg_type = ev_new.type
    if (msg_type == "newpb"){
      let new_pb = ev_new.pb;
      setPositionBoard(new_pb)
      setTurn((turn + 1) % 4);
      setTextbox(`It is ${player_names[(turn + 1) % 4]}'s turn`);
      if (ev_new.new_deck){
        setDeck(ev_new.new_deck);
      }
    }
    else if (msg_type == "win"){
      setPositionBoard(ev_new.pb);
      alert(`Team ${ev_new.colour} has won!!!`);
      setTurn(5);
      setTextbox(`Game has been won by team ${ev_new.colour}`)
    }

    else if (msg_type == "draw"){
      setPositionBoard(ev_new.pb);
      alert("Its a draw");
      setTurn(5);
      setTextbox("Game has been drawed.")
    }

  }

  let words = card.split(" ");
  let rank = ""; let suit = "";
  if (words.length == 3) {
    rank = words[1];
    suit = words[2];
  }
  if (words.length == 2){
    return (
      <div>
        <li>
          <div className={card}><span className="rank" ></span></div>
        </li>
      </div>
    )
  }
  else{
    if (positionBoard.length > 1) {
      if (positionBoard[row][column] == "-"){
        return (
          <div>
            <li>
              <button onClick={onClickCard}>
                <div className={card}><span className="rank" >{rank.substring(5)}</span><span className="suit">{dict[suit]}</span></div>
              </button>
            </li>
          </div>
        )
      }
      else{
        return (
          <div>
            <li>
              <div className="card"><div className={positionBoard[row][column]}></div></div>
            </li>
          </div>
        )
      }
    }
    else{
      return <div></div>
    }
  }
}


const Board = ({ setTextbox, username, turn, setTurn, colour, board, deck, setDeck , setPositionBoard, positionBoard}) => {

  if (board){
    return(
      <div className="container">
        {board.map((cardCol,i) => {
          return (
            <div>
              <div className="playingCards fourColours rotateHand">
                <ul className="table">
                  {cardCol.map((card,j) => {
                    return <Card setTextbox={setTextbox} username={username} turn={turn} setTurn={setTurn} colour={colour} positionBoard={positionBoard} row={i} column={j} card={card} deck={deck} setDeck={setDeck} setPositionBoard={setPositionBoard} />
                    
                  })}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  else{
    return <div></div>
  }
}


const Sequence = () => {
  const [board, setBoard] = React.useState([[]]);
  const [positionBoard, setPositionBoard] = React.useState([[]]);
  const [cards, setCards] = React.useState([]);
  const [deck, setDeck] = React.useState([]);
  const [turn, setTurn] = React.useState(4);
  const [username, setUsername] = React.useState("");
  const [colour, setColour] = React.useState("");
  const [textbox, setTextbox] = React.useState("Waiting for 4 players to join");
  const [isjack, setIsjack] = React.useState(false);

  
  ws.onmessage = (ev) => {
    console.log("here");
    let ev_new = JSON.parse(ev.data)
    let msg_type = ev_new.type
    if (msg_type == "newboard"){
      let new_board = ev_new.board
      let pos_board = ev_new.positionBoard
      let my_cards = ev_new.cards
      setBoard(new_board);
      setPositionBoard(pos_board);
      setDeck(my_cards)
      setUsername(ev_new.username);
      setColour(ev_new.colour);
      setTurn(0);
      setTextbox("It is player1's turn");
    }
  }

  return (
    <div>
      {username}
      <Board setTextbox={setTextbox} username={username} turn={turn} setTurn={setTurn} colour={colour} positionBoard={positionBoard} board={board} deck={deck} setDeck={setDeck} setPositionBoard={setPositionBoard}/>
      <div className="container">
        <div>
          <h1>Your Cards:</h1>
        </div>
        <div className="playingCards fourColours rotateHand">
            <ul className="table">
              {deck.map(card =>{

                if (card.split(" ")[1].substring(5) != "j"){
                  return(
                    <li>
                      <a className={card}><span className="rank">{card.split(" ")[1].substring(5)}</span><span className="suit">{dict[card.split(" ")[2]]}</span></a>
                    </li>
                  )
                }
                else{
                  return(
                    <li>
                      <a className={card}><span className="rank">{card.split(" ")[1].substring(5)}</span><span className="suit">{dict[card.split(" ")[2]]}</span></a>
                    </li>
                  )
                }
              })}
            </ul>
        </div>
        <div className="text_box">{textbox}</div>
        <div className={`color ${colour}`}></div>
      </div>
    </div>
  );
};

ReactDOM.render(<Sequence />, document.querySelector(`#root`));
