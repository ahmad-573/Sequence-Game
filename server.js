const fs = require(`fs`);
const http = require(`http`);
const internal = require("stream");
const WebSocket = require(`ws`); // npm i ws

let players = 0;
let moves = 0;
let decks_used = 0;

const board = [
  [
    "card back",
    "card rank-2 spades",
    "card rank-3 spades",
    "card rank-4 spades",
    "card rank-5 spades",
    "card rank-10 diams",
    "card rank-q diams",
    "card rank-k diams",
    "card rank-a diams",
    "card back",
  ],

  [
    "card rank-6 clubs",
    "card rank-5 clubs",
    "card rank-4 clubs",
    "card rank-3 clubs",
    "card rank-2 clubs",
    "card rank-4 spades",
    "card rank-5 spades",
    "card rank-6 spades",
    "card rank-7 spades",
    "card rank-a clubs",
  ],

  [
    "card rank-7 clubs",
    "card rank-a spades",
    "card rank-2 diams",
    "card rank-3 diams",
    "card rank-4 diams",
    "card rank-k clubs",
    "card rank-q clubs",
    "card rank-10 clubs",
    "card rank-8 spades",
    "card rank-k clubs",
  ],

  [
    "card rank-8 clubs",
    "card rank-k spades",
    "card rank-6 clubs",
    "card rank-5 clubs",
    "card rank-4 clubs",
    "card rank-9 hearts",
    "card rank-8 hearts",
    "card rank-9 clubs",
    "card rank-9 spades",
    "card rank-6 spades",
  ],

  [
    "card rank-9 clubs",
    "card rank-q spades",
    "card rank-7 clubs",
    "card rank-6 hearts",
    "card rank-5 hearts",
    "card rank-2 hearts",
    "card rank-7 hearts",
    "card rank-8 clubs",
    "card rank-10 spades",
    "card rank-10 clubs",
  ],

  [
    "card rank-a spades",
    "card rank-7 hearts",
    "card rank-9 diams",
    "card rank-a hearts",
    "card rank-4 hearts",
    "card rank-3 hearts",
    "card rank-k hearts",
    "card rank-10 diams",
    "card rank-6 hearts",
    "card rank-2 diams",
  ],

  [
    "card rank-k spades",
    "card rank-8 hearts",
    "card rank-8 diams",
    "card rank-2 clubs",
    "card rank-3 clubs",
    "card rank-10 hearts",
    "card rank-q hearts",
    "card rank-q diams",
    "card rank-5 hearts",
    "card rank-3 diams",
  ],

  [
    "card rank-q spades",
    "card rank-9 hearts",
    "card rank-7 diams",
    "card rank-6 diams",
    "card rank-5 diams",
    "card rank-a clubs",
    "card rank-a diams",
    "card rank-k diams",
    "card rank-4 hearts",
    "card rank-4 diams",
  ],

  [
    "card rank-10 spades",
    "card rank-10 hearts",
    "card rank-q hearts",
    "card rank-k hearts",
    "card rank-a hearts",
    "card rank-3 spades",
    "card rank-2 spades",
    "card rank-2 hearts",
    "card rank-3 hearts",
    "card rank-5 diams",
  ],

  [
    "card back",
    "card rank-9 spades",
    "card rank-8 spades",
    "card rank-7 spades",
    "card rank-6 spades",
    "card rank-9 diams",
    "card rank-8 diams",
    "card rank-7 diams",
    "card rank-6 diams",
    "card back",
  ],
];

const positionBoard = [
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"],
];

const deck = [
  "card rank-a spades",
  "card rank-2 spades",
  "card rank-3 spades",
  "card rank-4 spades",
  "card rank-5 spades",
  "card rank-6 spades",
  "card rank-7 spades",
  "card rank-8 spades",
  "card rank-9 spades",
  "card rank-10 spades",
  "card rank-j spades",
  "card rank-q spades",
  "card rank-k spades",
  "card rank-a clubs",
  "card rank-2 clubs",
  "card rank-3 clubs",
  "card rank-4 clubs",
  "card rank-5 clubs",
  "card rank-6 clubs",
  "card rank-7 clubs",
  "card rank-8 clubs",
  "card rank-9 clubs",
  "card rank-10 clubs",
  "card rank-j clubs",
  "card rank-q clubs",
  "card rank-k clubs",
  "card rank-a diams",
  "card rank-2 diams",
  "card rank-3 diams",
  "card rank-4 diams",
  "card rank-5 diams",
  "card rank-6 diams",
  "card rank-7 diams",
  "card rank-8 diams",
  "card rank-9 diams",
  "card rank-10 diams",
  "card rank-j diams",
  "card rank-q diams",
  "card rank-k diams",
  "card rank-a hearts",
  "card rank-2 hearts",
  "card rank-3 hearts",
  "card rank-4 hearts",
  "card rank-5 hearts",
  "card rank-6 hearts",
  "card rank-7 hearts",
  "card rank-8 hearts",
  "card rank-9 hearts",
  "card rank-10 hearts",
  "card rank-j hearts",
  "card rank-q hearts",
  "card rank-k hearts",
];


const checkWin = (colour) => {
  // Check in rows
  for (let i = 0; i < positionBoard.length; i++){
    let curr_in = false;
    let count = 0;
    for (let j = 0; j < positionBoard[0].length; j++){
      if (positionBoard[i][j] == colour) {curr_in = true; count += 1}
      else {curr_in = false; count = 0;}
      if (count == 5){
        return true;
      }
    }
  }

  //Check in columns
  for (let i = 0; i < positionBoard[0].length; i++){
    let curr_in = false;
    let count = 0;
    for (let j = 0; j < positionBoard.length; j++){
      if (positionBoard[j][i] == colour) {curr_in = true; count += 1}
      else {curr_in = false; count = 0;}
      if (count == 5){
        return true;
      }
    }
  }

  // // check in diagonals in upper half
  // for (let s = 0; s < positionBoard.length; s++){
  //   let curr_in = false;
  //   let count = 0;
  //   for (let i = 0;i <= s;i++){
  //     if (positionBoard[s-i][i] == colour) {curr_in = true; count += 1}
  //     else {curr_in = false; count = 0;}
  //     if (count == 5){
  //       return true;
  //     }
  //   }
  // }

  // // check in diagonals in lower half
  // for (let s = positionBoard.length; s < 2*positionBoard.length; s++){
  //   let curr_in = false;
  //   let count = 0;
  //   for (let i = 0;i <= ;i++){
  //     if (positionBoard[s-i][i] == colour) {curr_in = true; count += 1}
  //     else {curr_in = false; count = 0;}
  //     if (count == 5){
  //       return true;
  //     }
  //   }
  // }
}


const divideDeckIntoPieces = (deck) => {
  let shuffled = deck
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  const result = new Array(Math.ceil(shuffled.length / 6))
    .fill()
    .map((_) => shuffled.splice(0, 6));
  console.log(result);
  return result;
};

// code to read file
const readFile = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, `utf-8`, (readErr, fileContents) => {
      if (readErr) {
        reject(readErr);
      } else {
        resolve(fileContents);
      }
    });
  });

// code to create a server
const server = http.createServer(async (req, resp) => {
  console.log(`browser asked for ${req.url}`);
  if (req.url == `/mydoc`) {
    const clientHtml = await readFile(`client.html`);
    resp.end(clientHtml);
  } else if (req.url == `/myjs`) {
    const clientJs = await readFile(`client.js`);
    resp.end(clientJs);
  } else if (req.url == `/sequence.css`) {
    const sequenceCss = await readFile(`sequence.css`);
    resp.end(sequenceCss);
  } else {
    resp.end(`not found`);
  }
});

let decks = divideDeckIntoPieces(deck);

// to listen for clients
server.listen(8000);

// creating a web socket
const wss = new WebSocket.Server({ port: 8080 });

wss.on(`connection`, (ws) => {
  console.log(`New Join`)
  players += 1;
  ws.id = `player${players}`
  if (players == 4){
    wss.clients.forEach((client) => {
      if(client.readyState === WebSocket.OPEN){
        color = "";
        if (client.id == "player1" || client.id == "player3") color = "blue"
        else color = "green";
        const toClient = {
          type: `newboard`,
          board: board,
          positionBoard: positionBoard,
          cards: decks[parseInt(client.id.substring(6)) - 1],
          username: client.id,
          colour: color
        }
        console.log(toClient);
        client.send(JSON.stringify(toClient));
        decks_used += 1;
      }
  })
  }

  ws.on(`message`, (message) => {
    const msg = JSON.parse(message);
    if (msg.type == "move"){
      moves += 1;
      wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
          positionBoard[msg.row][msg.column] = msg.colour;
          const toSend = {
            type: "newpb",
            pb: positionBoard,
          }
          if (checkWin(msg.colour)){
            client.send(JSON.stringify({type: "win", colour: msg.colour, pb: positionBoard}));
          }
          else if (moves == 24) {
            toSend.new_deck = decks[decks_used - 1];
            decks_used += 1;
            client.send(JSON.stringify(toSend));
          }
          else if (moves == 48){
            client.send(JSON.stringify({type: "draw", pb: positionBoard}));
          }
          else client.send(JSON.stringify(toSend));
        }
    })


    }
  })
})
