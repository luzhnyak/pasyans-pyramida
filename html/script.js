function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Створюємо і перемішуємо колоду карт
function createDeck() {
  var d = [
    ["Clovers", "2", 2],
    ["Clovers", "3", 3],
    ["Clovers", "4", 4],
    ["Clovers", "5", 5],
    ["Clovers", "6", 6],
    ["Clovers", "7", 7],
    ["Clovers", "8", 8],
    ["Clovers", "9", 9],
    ["Clovers", "10", 10],
    ["Clovers", "J", 11],
    ["Clovers", "Q", 12],
    ["Clovers", "K", 13],
    ["Clovers", "A", 1],
    ["Hearts", "2", 2],
    ["Hearts", "3", 3],
    ["Hearts", "4", 4],
    ["Hearts", "5", 5],
    ["Hearts", "6", 6],
    ["Hearts", "7", 7],
    ["Hearts", "8", 8],
    ["Hearts", "9", 9],
    ["Hearts", "10", 10],
    ["Hearts", "J", 11],
    ["Hearts", "Q", 12],
    ["Hearts", "K", 13],
    ["Hearts", "A", 1],
    ["Pikes", "2", 2],
    ["Pikes", "3", 3],
    ["Pikes", "4", 4],
    ["Pikes", "5", 5],
    ["Pikes", "6", 6],
    ["Pikes", "7", 7],
    ["Pikes", "8", 8],
    ["Pikes", "9", 9],
    ["Pikes", "10", 10],
    ["Pikes", "J", 11],
    ["Pikes", "Q", 12],
    ["Pikes", "K", 13],
    ["Pikes", "A", 1],
    ["Tiles", "2", 2],
    ["Tiles", "3", 3],
    ["Tiles", "4", 4],
    ["Tiles", "5", 5],
    ["Tiles", "6", 6],
    ["Tiles", "7", 7],
    ["Tiles", "8", 8],
    ["Tiles", "9", 9],
    ["Tiles", "10", 10],
    ["Tiles", "J", 11],
    ["Tiles", "Q", 12],
    ["Tiles", "K", 13],
    ["Tiles", "A", 1],
  ];

  while (d.length > 0) {
    var rnd = getRandomInt(0, d.length);

    deck.push({
      mast: d[rnd][0],
      rist: d[rnd][1],
      activ: false,
      ochko: d[rnd][2],
      remov: false,
    });
    d.splice(rnd, 1);
  }
}

// Додаємо одну карту на ігровий стіл
function addCards(i, x, y) {
  cards[i] = document.createElement("div");
  cards[i].className = "cards";
  cards[i].style.backgroundImage =
    "url(images/" + deck[i].mast + "-" + deck[i].rist + ".png)";
  cards[i].style.left = x + "px";
  cards[i].style.top = y + "px";
  cards[i].onclick = function () {
    clickCards(i);
  };
  game.appendChild(cards[i]);
}

// Опрацьовуємо клік по карті

function clickCards(i) {
  if (deck[i].activ) {
    if (chekA == 0) {
      if (deck[i].ochko == 13) {
        game.removeChild(cards[i]);
        deck[i].remov = true;
        points++;
        pointsGame.textContent = "Очки: " + points * 5;
        changeActiv();
      } else {
        chekA = i;
        cards[i].classList.toggle("card-cheked");
      }
    } else if (chekA == i) {
      chekA = 0;
      cards[i].classList.toggle("card-cheked");
    } else {
      console.log(deck[i].ochko + deck[chekA].ochko);
      if (deck[i].ochko + deck[chekA].ochko == 13) {
        game.removeChild(cards[i]);
        game.removeChild(cards[chekA]);
        deck[i].remov = true;
        points++;
        pointsGame.textContent = "Очки: " + points * 5;
        deck[chekA].remov = true;
        changeActiv();
        chekA = 0;
        if (chekA == 1 || i == 1) {
          alert("Перемога!");
        }
      }
    }
  } else if (i > 28) {
    x = 120;
    cards[lastB].style.backgroundImage =
      "url(images/" + deck[lastB].mast + "-" + deck[lastB].rist + ".png)";
    cards[lastB].style.left = x + "px";
    cards[lastB].style.zIndex = i;
    deck[lastB].activ = true;
    if (chekA != 0) {
      cards[chekA].classList.toggle("card-cheked");
      chekA = 0;
    }
    lastB++;
  }
}

function changeActiv() {
  var r = 1,
    k = 1;
  for (var i = 1; i <= 21; i++) {
    k++;
    if (deck[i + r].remov & deck[i + r + 1].remov) {
      deck[i].activ = true;
    }
    if (k > r) {
      r++;
      k = 1;
    }
    if (deck[i + r].remov & deck[i + r + 1].remov) {
      deck[i].activ = true;
    }
  }

  for (var i = 29; i <= 52; i++) {
    if (deck[i].remov) {
      deck[i - 1].activ = true;
    }
  }
}

// Розстановка карт на ігровому полі
function changeCards() {
  for (var i = 1; i <= 28; i++) {
    var x = wGame / 2 + 50 - (r * wCard) / 2 + (k - 1) * wCard;
    var y = 5 + (r - 1) * 40;
    k++;
    if (r > 6) {
      deck[i].activ = true; // statement
    }
    if (k > r) {
      r++;
      k = 1;
    }

    addCards(i, x, y);
  }
  for (var i = 29; i <= 52; i++) {
    x = 10;
    y = 5;
    addCards(i, x, y);
    cards[i].style.backgroundImage = "url(images/Rubashka.png)";
  }
}

function loadGame() {
  winLoad = document.createElement("div");
  winLoad.textContent = "Пасьянс 'Піраміда'";
  winLoad.className = "load-game";
  game.appendChild(winLoad);
  imgGame = [];
  for (var i = 1; i < 52; i++) {
    imgGame[i] = document.createElement("img");
    imgGame[i].src = "images/" + deck[i].mast + "-" + deck[i].rist + ".png";
    imgGame[i].style.left = 25 + i * 14.5 + "px";
    winLoad.appendChild(imgGame[i]);
  }

  startGame = document.createElement("button");
  startGame.className = "start-game";
  startGame.textContent = "Розпочати гру";
  startGame.onclick = function () {
    game.removeChild(winLoad);
  };
  winLoad.appendChild(startGame);
  helpGame = document.createElement("iframe");
  helpGame.className = "help-game";
  helpGame.src = "help.html";
  // helpGame.scrolling="no";
  winLoad.appendChild(helpGame);
}

function newGameLoad() {
  for (var i = 1; i <= 52; i++) {
    deck[i].activ = false;
    if (!deck[i].remov) {
      game.removeChild(cards[i]);
    }
  }

  deck = [{ mast: "Rubashka", rist: "", activ: false, ochko: 0 }];
  createDeck();
  r = 1;
  k = 1;
  points = 0;
  (chekA = 0), (lastB = 29);
  changeCards();
}

var clock = document.getElementById("clock");
setInterval(function () {
  var time = new Date();
  clock.textContent = time.toLocaleTimeString();
}, 1000);

var newGame = document.getElementById("new-game");
newGame.onclick = function () {
  newGameLoad();
};

var game = document.getElementById("game");
var cardsImage = [
  "Clovers-2.png",
  "Clovers-3.png",
  "Clovers-4.png",
  "Clovers-5.png",
  "Clovers-6.png",
  "Clovers-7.png",
  "Clovers-8.png",
  "Clovers-9.png",
  "Clovers-10.png",
  "Clovers-J.png",
  "Clovers-Q.png",
  "Clovers-K.png",
  "Clovers-A.png",
  "Hearts-2.png",
  "Hearts-3.png",
  "Hearts-4.png",
  "Hearts-5.png",
  "Hearts-6.png",
  "Hearts-7.png",
  "Hearts-8.png",
  "Hearts-9.png",
  "Hearts-10.png",
  "Hearts-J.png",
  "Hearts-Q.png",
  "Hearts-K.png",
  "Hearts-A.png",
  "Pikes-2.png",
  "Pikes-3.png",
  "Pikes-4.png",
  "Pikes-5.png",
  "Pikes-6.png",
  "Pikes-7.png",
  "Pikes-8.png",
  "Pikes-9.png",
  "Pikes-10.png",
  "Pikes-J.png",
  "Pikes-Q.png",
  "Pikes-K.png",
  "Pikes-A.png",
  "Tiles-2.png",
  "Tiles-3.png",
  "Tiles-4.png",
  "Tiles-5.png",
  "Tiles-6.png",
  "Tiles-7.png",
  "Tiles-8.png",
  "Tiles-9.png",
  "Tiles-10.png",
  "Tiles-J.png",
  "Tiles-Q.png",
  "Tiles-K.png",
  "Tiles-A.png",
  "Joker.png",
  "Joker.png",
];
var cards = new Array(53);
var deck = [{ mast: "Rubashka", rist: "", activ: false, ochko: 0 }];
var points = 0;

pointsGame = document.createElement("div");
pointsGame.textContent = "Очки: 0";
pointsGame.className = "points";
game.appendChild(pointsGame);

var chekA = 0,
  lastB = 29;
var wGame = game.offsetWidth;
var wCard = 100;
var r = 1,
  k = 1;
createDeck();
loadGame();
changeCards();
