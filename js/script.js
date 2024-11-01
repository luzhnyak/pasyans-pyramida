var cvs = document.getElementById("canvas");
// var sensor = document.getElementById("sensor");
var close_help = document.getElementById("close");
var start_help = document.getElementById("help-start");
var new_game = document.getElementById("new-game");
var help = document.getElementById("help");
var ctx = cvs.getContext("2d");

var flask = new XMLHttpRequest();
var params = window.location.search
  .replace("?", "")
  .split("&")
  .reduce(function (p, e) {
    var a = e.split("=");
    p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
    return p;
  }, {});

var user_id = (start = params["user_id"]);
// var chat_id = start=params['chat_id'];
var inline_message_id = (start = params["inline_message_id"]);

close_help.onclick = function () {
  help.className = "help-none";
};
start_help.onclick = function () {
  help.className = "help-block";
};
new_game.onclick = function () {
  newGameLoad();
};

var w = 740; // document.documentElement.clientWidth;
var h = 840; // document.documentElement.clientHeight;
w_client = document.documentElement.offsetWidth;
if (w_client > 740) w_client = 740;
console.log(w_client);

cvs.width = w;
cvs.height = h;

var top_game = 80;
var top_card = top_game + 70;

var w_card = Math.floor((w - 10) / 7);
if (w_card > 100) {
  w_card = 100;
}
var h_card = Math.floor((w_card / 10) * 14);

var left_deck = 20;
var top_deck = top_game;
var top_points = h - 100;

// var cardsImage=["Clovers-2.png", "Clovers-3.png", "Clovers-4.png", "Clovers-5.png", "Clovers-6.png", "Clovers-7.png", "Clovers-8.png", "Clovers-9.png", "Clovers-10.png", "Clovers-J.png", "Clovers-Q.png", "Clovers-K.png", "Clovers-A.png", "Hearts-2.png", "Hearts-3.png", "Hearts-4.png", "Hearts-5.png", "Hearts-6.png", "Hearts-7.png", "Hearts-8.png", "Hearts-9.png", "Hearts-10.png", "Hearts-J.png", "Hearts-Q.png", "Hearts-K.png", "Hearts-A.png", "Pikes-2.png", "Pikes-3.png", "Pikes-4.png", "Pikes-5.png", "Pikes-6.png", "Pikes-7.png", "Pikes-8.png", "Pikes-9.png", "Pikes-10.png", "Pikes-J.png", "Pikes-Q.png", "Pikes-K.png", "Pikes-A.png", "Tiles-2.png", "Tiles-3.png", "Tiles-4.png", "Tiles-5.png", "Tiles-6.png", "Tiles-7.png", "Tiles-8.png", "Tiles-9.png", "Tiles-10.png", "Tiles-J.png", "Tiles-Q.png", "Tiles-K.png", "Tiles-A.png", "Joker.png", "Joker.png"];
// var cards=new Array(53);
var deck = [{ mast: "None", rist: "", activ: false, ochko: 0, x: 0, y: 0 }];
var points = 0;
var bonus = 0;
// var cardWidth=(cvs.getBoundingClientRect().width-10)/7;
// console.log(w_card);

// Малюємо карти на столі
// var i=1;
function drawCards() {
  ctx.clearRect(0, 0, w, h);
  for (var i = 0; i <= 52; i++) {
    if (!deck[i].remov) {
      ctx.drawImage(deck[i].card, deck[i].x, deck[i].y, w_card, h_card);
      if (deck[i].cheked) {
        var imgData = ctx.getImageData(deck[i].x, deck[i].y, w_card, h_card);
        var data = imgData.data;

        for (var j = 0, len = data.length; j < len; j += 4) {
          data[j] = 255 - data[j];
          data[j + 1] = 255 - data[j + 1];
          data[j + 2] = 255 - data[j + 2];
        }

        ctx.putImageData(imgData, deck[i].x, deck[i].y);
      }
    }
  }

  ctx.fillStyle = "#103504";
  ctx.font = "bold 120px 'Comic Sans MS'";
  ctx.textAlign = "center";
  ctx.shadowColor = "#456231";
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 5;
  ctx.fillText(points, w - 140, top_game + 120);

  ctx.textAlign = "center";
  ctx.fillStyle = "#152BD2";
  if (deck[1].remov) ctx.fillText("Перемога!", w / 2, 400);

  ctx.shadowColor = "#456231";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  requestAnimationFrame(drawCards);
}

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
      ochko: d[rnd][2],
      activ: false,
      remov: false,
      cheked: false,
      x: 0,
      y: 0,
      card: new Image(),
    });
    d.splice(rnd, 1);
  }

  var r = 1,
    k = 1,
    x = 0,
    y = 0;
  // Розраховуєм положення карти на полі
  for (var i = 1; i <= 28; i++) {
    deck[i].card.src = "img/Rubashka.png";
    x = w / 2 - (r * w_card) / 2 + (k - 1) * w_card;
    y = top_card + (r - 1) * 0.8 * w_card;
    // console.log(y);
    k++;
    if (r > 6) {
      deck[i].activ = true; // statement
      deck[i].card.src = "img/" + deck[i].mast + "-" + deck[i].rist + ".png";
    }
    if (k > r) {
      r++;
      k = 1;
    }
    deck[i].x = x;
    deck[i].y = y;
    console.log(deck[i]);
  }

  top_points = deck[28].y + h_card + (h - deck[28].y - h_card) / 2;
  for (var i = 29; i <= 52; i++) {
    deck[i].x = left_deck;
    deck[i].y = top_deck;
    deck[i].card.src = "img/Rubashka.png";
  }

  deck[0].cheked = false;
  deck[0].activ = false;
  deck[0].remov = false;
  deck[0].x = left_deck;
  deck[0].y = top_deck;
  deck[0].card = new Image();
  deck[0].card.src = "img/None.png";
  console.log(deck[0]);

  deck[52].card.onload = drawCards;
}

// sensor.onclick = function(e) {console.log(e);};

// // Опрацьовуємо клік по карті
var chekCard = 0;
var topCard = 29;
cvs.onclick = function (e) {
  console.log(e);
  x_click = (e.offsetX * 740) / w_client;
  y_click = (e.offsetY * 740) / w_client;
  console.log(e);
  for (var i = 1; i <= 52; i++) {
    if (
      x_click > deck[i].x &&
      x_click < deck[i].x + w_card &&
      y_click > deck[i].y &&
      y_click < deck[i].y + h_card &&
      deck[i].activ
    ) {
      // deck[i].remov = true;
      // deck[i].activ = false;
      // console.log(deck[i].mast+deck[i].rist);

      if (deck[i].ochko == 13) {
        //Якщо одна карта має 13 очків
        deck[i].activ = false;
        deck[i].remov = true;

        deck[chekCard].cheked = false;
        deck[i].cheked = false;
        chekCard = 0;
        points = points + 1 + bonus;
        bonus++;

        changeActiv();
      } else if (deck[i].cheked) {
        deck[i].cheked = false;
        chekCard = 0;
      } else if (deck[i].ochko + deck[chekCard].ochko == 13) {
        deck[i].activ = false;
        deck[i].remov = true;
        deck[i].cheked = false;
        deck[chekCard].activ = false;
        deck[chekCard].remov = true;
        deck[chekCard].cheked = false;

        chekCard = 0;
        points = points + 1 + bonus;
        bonus++;
        changeActiv();
      } else if (chekCard != 0) {
        deck[chekCard].cheked = false;
        chekCard = 0;
      } else {
        deck[i].cheked = true;
        chekCard = i;
      }
    }
  }

  if (
    topCard == 53 &&
    x_click > deck[0].x &&
    x_click < deck[0].x + w_card &&
    y_click > deck[0].y &&
    y_click < deck[0].y + h_card
  ) {
    topCard = 29;
    while (true) {
      if (!deck[topCard].remov) break;
      topCard++;
    }
    for (var i = 29; i <= 52; i++) {
      deck[i].x = left_deck;
      deck[i].y = top_deck;
      deck[i].cheked = false;
      deck[i].activ = false;
      deck[i].card.src = "img/Rubashka.png";
    }
    console.log("NewDeck");
  } else if (
    topCard <= 52 &&
    x_click > deck[topCard].x &&
    x_click < deck[topCard].x + w_card &&
    y_click > deck[topCard].y &&
    y_click < deck[topCard].y + h_card
  ) {
    deck[topCard].x = deck[topCard].x + w_card + 10;
    deck[topCard].activ = true;
    console.log(topCard);
    deck[topCard].card.src =
      "img/" + deck[topCard].mast + "-" + deck[topCard].rist + ".png";
    if (bonus > 0) bonus--;
    while (true) {
      topCard++;
      if (topCard > 52 || !deck[topCard].remov) break;
    }
    changeActiv();
  }

  if (deck[1].remov) {
    flask.open(
      "GET",
      "https://luzhnyak.pp.ua/setscore/piramida?user_id=" +
        user_id +
        "&inline_message_id=" +
        inline_message_id +
        "&score=" +
        points,
      true
    );
    flask.send(null);
  }
};

function changeActiv() {
  var r = 1,
    k = 1;
  for (var i = 1; i <= 21; i++) {
    k++;
    if (!deck[i].remov && deck[i + r].remov && deck[i + r + 1].remov) {
      deck[i].activ = true;
      deck[i].card.src = "img/" + deck[i].mast + "-" + deck[i].rist + ".png";
    }
    if (k > r) {
      r++;
      k = 1;
    }
  }

  for (var i = topCard - 1; i >= 29; i--) {
    deck[i].activ = false;
  }
  j = 1;
  while (topCard - j >= 29) {
    // console.log(topCard);
    if (!deck[topCard - j].remov) {
      deck[topCard - j].activ = true;
      break;
    }
    j++;
  }
}

// Розстановка карт на ігровому полі
function changeCards() {
  var r = 1,
    k = 1;
  for (var i = 1; i <= 28; i++) {
    console.log(i);

    var x = w / 2 - (r * w_card) / 2 + (k - 1) * w_card;
    var y = 5 + (r - 1) * 50;
    k++;
    if (r > 6) {
      deck[i].activ = true; // statement
    }
    if (k > r) {
      r++;
      k = 1;
    }

    cards[i] = new Image();
    cards[i].src = "img/" + deck[i].mast + "-" + deck[i].rist + ".png";
  }
  // for (var i =  29; i <= 52; i++) {
  // 	x=10;
  // 	y=5;
  // 	drawCards(i,x,y);
  // 	// cards[i].style.backgroundImage="url(img/Rubashka.png)";
  // 	}
}

function newGameLoad() {
  //   flask.open(
  //     "GET",
  //     "https://luzhnyak.pp.ua/setscore/piramida?user_id=" +
  //       user_id +
  //       "&inline_message_id=" +
  //       inline_message_id +
  //       "&score=" +
  //       points,
  //     true
  //   );
  //   flask.send(null);

  deck = [{ mast: "None", rist: "", activ: false, ochko: 0, x: 0, y: 0 }];
  points = 0;
  bonus = 0;
  createDeck();

  // flask.onload = function (){
  //    	console.log(flask.responseText);
  // }
}

// var clock=document.getElementById('clock');
// setInterval(function(){var time = new Date(); clock.textContent=time.toLocaleTimeString()}, 1000);

// var newGame=document.getElementById('new-game');
// newGame.onclick=function() {newGameLoad()};

// var game=document.getElementById('game');

createDeck();

// loadGame();

// changeCards();
