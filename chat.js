var emojis = ["🍻", "💖", "🤯", "🤗", "🤔", "😇", "🤞", "✌", " 🤟", "🤘", "👌", "🙌", "👏", "👈", "👍", "🤝", "👊", "🎮", "🎲", "🎊", "🎀"];

window.onload = () => {
    newEmoji();
    document.getElementById("username").focus();
    var cachedUsername = localStorage.getItem("username");
    if(cachedUsername != undefined){
        document.getElementById("username").value = cachedUsername;
        document.getElementById("code").focus();
    }
}

var joined = false;


/* Javascript code: Connect to server*/
var socket = io.connect("localhost:9876");

socket.on("joined", package => {
    console.log(package)
    document.getElementById("insert").innerHTML = chat;
    package.chat.forEach(message => {
        var username = message.author;
    if(message.mod !== undefined){
        username = "<span style='color:red'>" + message.mod + "</span> " + username;
    }
        document.getElementById("messages").innerHTML += '<div class="message"> <span class="username">' + username + ':</span> ' + message.content + ' <span class="timestamp">' + message.date + '</span> </div>';
    })
    joined = true;
});

socket.on("disconnect", package => {

});

socket.on("err", message => {
    document.getElementById("err").innerText = message;
    document.getElementById("err").style.visibility = "visible"
});

socket.on("message", message => {
    var username = message.author;
    if(message.mod !== undefined){
        username = "<span style='color:red'>" + message.mod + "</span> " + username;
    }
    document.getElementById("messages").innerHTML += '<div class="message"> <span class="username">' + username + ':</span> ' + message.content + ' <span class="timestamp">' + message.date + '</span> </div>';
})


function join() {
    socket.emit("join", {
        username: document.getElementById("username").value,
        code: document.getElementById("code").value
    });
    localStorage.setItem("username", document.getElementById("username").value)
}

var login = '<div id="login-window"> <img src="logo.png" alt="Logo" id="logo" draggable="false"> <span class="login-text">Username:</span> <input type="text" class="login-input" placeholder="Username" id="username" oninput="updateName()" maxlength="15"> <span class="login-text">Code:</span> <input type="text" class="login-input" placeholder="5A2F0" maxlength="5" oninput="updateCode()" id="code"> <span id="err">Error message!</span> <button id="login-button" onclick="join()" onmouseover="newEmoji()">Join room</button> <span id="how-to"><a href="">How to see your match-code!</a></span> </div>';
var chat = '<div id="chat-window"> <div id="chat-header"><button id="back" class="btn" onclick="leave()">Leave</button></div> <div id="messages">  </div> <div id="chat-input-container"> <input type="text" placeholder="Say something!" id="chat-input"> </div> </div>';
var messageTemplate = '<div class="message"> <span class="username">Olle:</span> Message content <span class="timestamp">23:08</span> </div>';

document.addEventListener("keydown", e => {
    if(e.keyCode == 13){
        if(!joined) join();
            else send();
    }
})

function leave(){
    socket.emit("leave");
    document.getElementById("insert").innerHTML = login;
    window.onload();
}

function send(){
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
