"use strict";

var cvs = document.getElementById("canvas");
var close_help = document.getElementById("close");
var start_help = document.getElementById("help-start");
var new_game = document.getElementById("new-game");
var help = document.getElementById("help");
var ctx = cvs.getContext("2d");

var params = new URLSearchParams(window.location.search);
var user_id = params.get("user_id");
var inline_message_id = params.get("inline_message_id");
var scoreSubmitted = false;

close_help.onclick = function () {
  help.className = "help-none";
};
start_help.onclick = function () {
  help.className = "help-block";
};
new_game.onclick = function () {
  newGameLoad();
};
document.getElementById("share-game").onclick = function () {
  if (window.TelegramGameProxy && typeof window.TelegramGameProxy.shareScore === "function") {
    window.TelegramGameProxy.shareScore();
  }
};

var w = 740;
var h = 840;

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

var imageCache = new Map();
function getCardImage(src) {
  if (!imageCache.has(src)) {
    var image = new Image();
    image.onload = drawCards;
    image.onerror = function () {
      console.error("Не вдалося завантажити зображення карти:", src);
    };
    imageCache.set(src, image);
    image.src = src;
  }
  return imageCache.get(src);
}

var deck = [{ mast: "None", rist: "", activ: false, ochko: 0, x: 0, y: 0 }];
var points = 0;
var bonus = 0;

function drawCards() {
  ctx.clearRect(0, 0, w, h);
  for (var i = 0; i <= 52; i++) {
    if (!deck[i].remov && deck[i].card.complete && deck[i].card.naturalWidth > 0) {
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


}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

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
      card: null,
    });
    d.splice(rnd, 1);
  }

  var r = 1,
    k = 1,
    x = 0,
    y = 0;
  for (var i = 1; i <= 28; i++) {
    deck[i].card = getCardImage("img/Rubashka.png");
    x = w / 2 - (r * w_card) / 2 + (k - 1) * w_card;
    y = top_card + (r - 1) * 0.8 * w_card;
    k++;
    if (r > 6) {
      deck[i].activ = true;
      deck[i].card = getCardImage("img/" + deck[i].mast + "-" + deck[i].rist + ".png");
    }
    if (k > r) {
      r++;
      k = 1;
    }
    deck[i].x = x;
    deck[i].y = y;
  }

  for (var i = 29; i <= 52; i++) {
    deck[i].x = left_deck;
    deck[i].y = top_deck;
    deck[i].card = getCardImage("img/Rubashka.png");
  }

  deck[0].cheked = false;
  deck[0].activ = false;
  deck[0].remov = false;
  deck[0].x = left_deck;
  deck[0].y = top_deck;
  deck[0].card = getCardImage("img/None.png");

  drawCards();
}


var chekCard = 0;
var topCard = 29;
cvs.onclick = function (e) {
  if (deck[1].remov) {
    submitScore();
    return;
  }
  var bounds = cvs.getBoundingClientRect();
  if (!bounds.width || !bounds.height || help.className === "help-block") return;
  var x_click = ((e.clientX - bounds.left) * cvs.width) / bounds.width;
  var y_click = ((e.clientY - bounds.top) * cvs.height) / bounds.height;
  for (var i = 52; i >= 1; i--) {
    if (
      x_click > deck[i].x &&
      x_click < deck[i].x + w_card &&
      y_click > deck[i].y &&
      y_click < deck[i].y + h_card &&
      deck[i].activ && !deck[i].remov
    ) {

      if (deck[i].ochko == 13) {
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
      break;
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
    while (topCard <= 52 && deck[topCard].remov) topCard++;
    deck[chekCard].cheked = false;
    chekCard = 0;
    for (var i = 29; i <= 52; i++) {
      deck[i].x = left_deck;
      deck[i].y = top_deck;
      deck[i].cheked = false;
      deck[i].activ = false;
      deck[i].card = getCardImage("img/Rubashka.png");
    }
  } else if (
    topCard <= 52 &&
    x_click > deck[topCard].x &&
    x_click < deck[topCard].x + w_card &&
    y_click > deck[topCard].y &&
    y_click < deck[topCard].y + h_card
  ) {
    deck[chekCard].cheked = false;
    chekCard = 0;
    deck[topCard].x = left_deck + w_card + 10;
    deck[topCard].activ = true;
    deck[topCard].card = getCardImage(
      "img/" + deck[topCard].mast + "-" + deck[topCard].rist + ".png"
    );
    if (bonus > 0) bonus--;
    while (true) {
      topCard++;
      if (topCard > 52 || !deck[topCard].remov) break;
    }
    changeActiv();
  }

  drawCards();
  submitScore();
};

function submitScore() {
  if (deck[1].remov && !scoreSubmitted && user_id && inline_message_id) {
    scoreSubmitted = true;
    var scoreParams = new URLSearchParams({
      user_id: user_id,
      inline_message_id: inline_message_id,
      score: String(points),
    });
    var request = new XMLHttpRequest();
    request.open("GET", "https://luzhnyak.pp.ua/setscore/piramida?" + scoreParams, true);
    request.send(null);
  }
}

function changeActiv() {
  var r = 1,
    k = 1;
  for (var i = 1; i <= 21; i++) {
    k++;
    if (!deck[i].remov && deck[i + r].remov && deck[i + r + 1].remov) {
      deck[i].activ = true;
      deck[i].card = getCardImage("img/" + deck[i].mast + "-" + deck[i].rist + ".png");
    }
    if (k > r) {
      r++;
      k = 1;
    }
  }

  for (var i = topCard - 1; i >= 29; i--) {
    deck[i].activ = false;
  }
  var j = 1;
  while (topCard - j >= 29) {
    if (!deck[topCard - j].remov) {
      deck[topCard - j].activ = true;
      break;
    }
    j++;
  }
}

function newGameLoad() {
  chekCard = 0;
  topCard = 29;
  scoreSubmitted = false;
  deck = [{ mast: "None", rist: "", activ: false, ochko: 0, x: 0, y: 0 }];
  points = 0;
  bonus = 0;
  createDeck();

}

createDeck();
