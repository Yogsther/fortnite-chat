/**
 * Fortnite-Chat, Created by Yogsther 29/05-2018
 * http://chat.livfor.it/
 * https://github.com/Yogsther/
 */


var socket = io.connect("213.66.254.63:3074");

var emojis = ["🍻", "💖", "🤯", "🤗", "🤔", "😇", "🤞", "✌", " 🤟", "🤘", "👌", "🙌", "👏", "👈", "👍", "🤝", "👊", "🎮", "🎲", "🎊", "🎀"];

var joined = false;
window.onload = () => {
    newEmoji();
    document.getElementById("username").focus();
    var cachedUsername = localStorage.getItem("username");
    if (cachedUsername != undefined) {
        document.getElementById("username").value = cachedUsername;
        document.getElementById("code").focus();
    }
}


socket.on("joined", package => {
    document.getElementById("insert").innerHTML = chat;
    document.getElementById("chat-input").focus();
    package.chat.forEach(message => {
        var username = message.author;
        if (message.mod !== undefined) {
            message.mod = "[" + message.mod[0].toUpperCase() + message.mod.substr(1, message.mod.length - 1) + "]";
            username = "<span style='color:red'>" + message.mod + "</span> " + username;
        }
        var date = new Date(message.date);

        document.getElementById("messages").innerHTML += '<div class="message"> <span class="username">' + username + ':</span> ' + message.content + ' <span class="timestamp">' + date.getHours() + ":" + date.getMinutes() + '</span> </div>';
    })
    document.getElementById("size").innerText = "Connected users: "+package.names.length;

    joined = true;
});

socket.on("err", message => {
    try {
        document.getElementById("err").innerText = message;
        document.getElementById("err").style.visibility = "visible"
    } catch (e) {}
});

socket.on("message", message => {
    try {
        var username = message.author;
        if (message.mod !== undefined) {

            message.mod = "[" + message.mod[0].toUpperCase() + message.mod.substr(1, message.mod.length - 1) + "]";
            username = "<span style='color:red'>" + message.mod + "</span> " + username;
        }
        if(message.size !== undefined){
            document.getElementById("size").innerText = "Connected users: "+message.size;
        }
        var date = new Date(message.date);
        document.getElementById("messages").innerHTML += '<div class="message"> <span class="username">' + username + ':</span> ' + message.content + ' <span class="timestamp">' + date.getHours() + ":" + date.getMinutes() + '</span> </div>';

    } catch (e) {}
})

function join() {
    var token = null;
    if (document.getElementById("username").value.toLowerCase().substr(0, 4) == "mod_") {
        var chachedToken = localStorage.getItem("token");
        if (chachedToken == undefined) chachedToken = "";
        token = prompt("Please enter an admin token", chachedToken);
        localStorage.setItem("token", token);
    }
    socket.emit("join", {
        username: document.getElementById("username").value,
        code: document.getElementById("code").value,
        token: token
    });
    localStorage.setItem("username", document.getElementById("username").value)
}

var login = '<div id="login-window"> <img src="logo.png" alt="Logo" id="logo" draggable="false"> <span class="login-text">Username:</span> <input type="text" class="login-input" placeholder="Username" id="username" oninput="updateName()" maxlength="15"> <span class="login-text">Code:</span> <input type="text" class="login-input" placeholder="5A2F0" maxlength="5" oninput="updateCode()" id="code"> <span id="err">Error message!</span> <button id="login-button" onclick="join()" onmouseover="newEmoji()">Join room</button> <span id="how-to"><a href="">How to see your match-code!</a></span> </div>';
var chat = '<div id="chat-window"> <div id="chat-header"><button id="back" class="btn" onclick="leave()">Leave</button><span id="size">?</span></div> <div id="messages">  </div> <div id="chat-input-container"> <input type="text" placeholder="Say something!" id="chat-input"> </div> </div>';
var messageTemplate = '<div class="message"> <span class="username">Olle:</span> Message content <span class="timestamp">23:08</span> </div>';

document.addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        if (!joined) join();
        else send();
    }
})

function leave() {
    socket.emit("leave");
    joined = false;
    document.getElementById("insert").innerHTML = login;
    window.onload();
}

function send() {
    socket.emit("message", document.getElementById("chat-input").value);
    document.getElementById("chat-input").value = "";
}

function newEmoji() {
    document.getElementById("login-button").textContent = "Join room " + emojis[Math.floor(Math.random() * emojis.length)];
}

function updateCode() {
    var value = document.getElementById("code").value
    value = value.replace(/[^a-z0-9]/gi, '');
    document.getElementById("code").value = value.toUpperCase();
}

function updateName() {
    var value = document.getElementById("username").value
    value = value.replace(/[^a-z0-9_ .]/gi, '');
    document.getElementById("username").value = value;
}