// Twitch stuff probably won't work localy, just mock atoken and userid
var atoken, userId, username, currPoke, moveUsed;
var countdownDiv = document.getElementById("countdown-div");
var countdownText = document.getElementById("countdown-text");
var readyUpButton = document.getElementById("ready-up");
var skipMeButton = document.getElementById("skip-me");
var defaultCountdownText = "You are one of the next X trainers, please ready up within the next YY seconds";
var readyText = document.getElementById("ready-text");
function ensureDivVisibility(divElement, containerElement) {
    if (containerElement === void 0) { containerElement = window; }
    // Get element and container dimensions
    var elementRect = divElement.getBoundingClientRect();
    // Check if element is fully visible within container
    var isFullyVisible = (elementRect.top >= 0 &&
        elementRect.right <= window.innerWidth &&
        elementRect.bottom <= window.innerHeight &&
        elementRect.left >= 0);
    console.log(elementRect);
    // If not fully visible, adjust position
    if (!isFullyVisible) {
        // Apply adjustments to the element's style
        divElement.style.top = "10px";
        divElement.style.left = "10px";
    }
}
function handleWhisper(message) {
    if (message.hasOwnProperty("readyup")) {
        console.log(message);
        if (countdown > 0) {
            console.log("Countdown already triggered");
        }
        else {
            console.log(countdownDiv);
            countdownDiv.style.display = "block";
            trainersCount = message.num_trainers;
            countdown = message.countdown;
            updateCountdown();
        }
    }
    else {
        readyText.textContent = "";
        updatePokemon(message);
        ensureDivVisibility(document.getElementById("moveable"));
    }
}
var countdown = -1; // Initial countdown value
var trainersCount = 3; // Initial X value
function updateCountdown() {
    if (countdown > 0) {
        countdownText.textContent = defaultCountdownText.replace(/YY/g, countdown).replace(/X/g, trainersCount);
        countdown--;
        setTimeout(updateCountdown, 1000);
    }
    else {
        // Call your function here when countdown reaches 0
        countdownFinished();
    }
}
function countdownFinished() {
    countdownDiv.style.display = "none"; // Hide the div
    countdown = -1;
    // Perform any other actions needed when countdown is finished
}
// Event listeners for buttons
readyUpButton.addEventListener("click", function () {
    countdownFinished();
    sendMessage("I'm ready");
});
skipMeButton.addEventListener("click", function () {
    countdownFinished();
    sendMessage("Skip Me");
});
function checkChatter(chatter_list) {
    console.log(username);
    console.log(chatter_list);
    console.log(chatter_list.includes(username));
    if (chatter_list.includes(username)) {
        showPokeballGif();
    }
    else {
        showPokeballStatic();
    }
}
var Dragonair = {
    "uid": "U135753687",
    "nature": "Hasty",
    "curHP": 33,
    "name": "Dragonair",
    "stats": {
        "atk": 20,
        "hp": 33,
        "def": 17,
        "spa": 15,
        "spe": 20,
        "spd": 11
    },
    "types": [
        "dragon",
        "fire"
    ],
    "moves": [
        {
            "category": "Special",
            "name": "Psych Up",
            "power": "90",
            "type": "normal",
            "accuracy": "0",
            "pp": 10
        },
        {
            "category": "Status",
            "name": "Fake Tears",
            "power": "0",
            "type": "dark",
            "accuracy": "100",
            "pp": 20
        },
        {
            "category": "Physical",
            "name": "Jump Kick",
            "power": "70",
            "type": "fighting",
            "accuracy": "95",
            "pp": 3
        },
        {
            "category": "Status",
            "name": "Conversion 2",
            "power": "0",
            "type": "normal",
            "accuracy": "0",
            "pp": 0
        }
    ],
    "ability": "Swift Swim"
};
function updateRivalMoves(rival_moves_count) {
    countdown = rival_moves_count.countdown;
    delete rival_moves_count.countdown;
    for (var moveName in rival_moves_count) {
        // Check if the move name matches the value of any of your elements
        for (var i = 0; i <= 3; i++) { // Assuming i starts from 1 and goes up to 4
            if ($("#move".concat(i)).val() === moveName) {
                console.log("Move with name \"".concat(moveName, "\" is associated with element #move").concat(i));
                var moveCount = rival_moves_count[moveName];
                // Check if the #move${i}-count element exists
                var moveCountElement = $("#move".concat(i, "-count"));
                if (!moveCountElement.length) {
                    // If it doesn't exist, create it and append it to the #move${i}-category section
                    $("#move".concat(i, "-category")).append("<span id=\"move".concat(i, "-count\">").concat(moveCount, "</span>"));
                }
                else {
                    // If it exists, update the value
                    moveCountElement.text(moveCount);
                }
                break; // Exit the inner loop once a match is found for this moveName
            }
        }
    }
}
function updatePokemon(pokemon) {
    console.log(pokemon);
    resetCustomTags();
    // In theory the "moveable" tag should be able to be dragged around a webpage, I was hoping users could move the extension to where they want it to be.
    $('.primary').css("display", "block");
    $('.waiting').hide();
    currPoke = pokemon;
    moveUsed = false;
    $('#name').text(pokemon.name);
    var types = pokemon.types.filter(Boolean);
    for (var t = 0; t < types.length; t++) {
        $("#type".concat(t)).addClass("type-".concat(types[t]));
        $("#type".concat(t)).text(types[t]);
    }
    if (types.length != 2) {
        $('#type1').hide();
        $('#type1').text('');
    }
    $('#ability').text('Ability: ' + pokemon.ability);
    $('.current-health').text(pokemon.curHP);
    $('.max-health').text(pokemon.stats.hp);
    $('.attack').text(pokemon.stats.atk);
    $('.defense').text(pokemon.stats.atk);
    $('.special-attack').text(pokemon.stats.spa);
    $('.special-defense').text(pokemon.stats.spd);
    $('.speed').text(pokemon.stats.spe);
    for (var i = 0; i < pokemon.moves.length; i++) {
        var move = pokemon.moves[i];
        var moveDetails = "Category: ".concat(move.category, ", Power: ").concat(move.power, ", Type: ").concat(move.type, ", Accuracy: ").concat(move.accuracy, ", PP: ").concat(move.pp);
        var buttonColor = '#a5ffa8';
        var isDisabled = (move.pp <= 0 || (pokemon.uid !== username && pokemon.uid !== 'chat'));
        var moveCategory = '';
        if (move.category == 'Physical') {
            moveCategory = '<img src="move-physical.png" alt="Physical" />';
        }
        else if (move.category == 'Status') {
            moveCategory = '<img src="move-status.png" alt="Status" />';
        }
        else if (move.category == 'Special') {
            moveCategory = '<img src="move-special.png" alt="Special" />';
        }
        // uid is sent to say which twitch user should be allowed to click the buttons.
        if (pokemon.uid !== username && pokemon.uid !== 'chat') {
            buttonColor = '#555753';
        }
        else if (move.pp < 5 && move.pp > 0) {
            buttonColor = '#fffd87';
        }
        else if (move.pp === 0) {
            buttonColor = '#fc7c7c';
        }
        var moveClass = move.name.replace(' ', '-');
        $("#move".concat(i)).prop('title', moveDetails);
        $("#move".concat(i)).prop('disabled', isDisabled);
        $("#move".concat(i)).val(move.name);
        // $(`#move${i}`).removeClass();
        // $(`#move${i}`).addClass('button');
        $("#move".concat(i)).addClass(moveClass);
        $("#move".concat(i)).css('background-color', buttonColor);
        $("#move".concat(i, "-name")).text(move.name);
        $("#move".concat(i, "-category")).html(moveCategory);
        // $(`#move${i}-type`).removeClass();
        // $(`#move${i}-type`).addClass('move-type')
        $("#move".concat(i, "-type")).addClass("type-".concat(move.type));
        $("#move".concat(i, "-type")).text(move.type);
        $("#move".concat(i, "-power")).text(move.power);
        $("#move".concat(i, "-pp")).text(move.pp);
        $("#move".concat(i)).off("click", useMove);
        $("#move".concat(i)).on("click", { move: $("#move".concat(i)).val() }, useMove);
    }
    $('.waiting').hide();
}
//This is some code I found online to move a div around.  haven't been able to verify it works in the extension yet.
dragElement(document.getElementById("moveable"));
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    console.log("#" + elmnt.id + "header");
    $("#pokeball-image").on('mousedown', dragMouseDown);
    $("#pokeball-gif").on('mousedown', dragMouseDown);
    // if ($("#name")) {
    //     // if present, the header is where you move the DIV from:
    //     $("#name").on('mousedown', dragMouseDown);
    // } else {
    //     // otherwise, move the DIV from anywhere inside the DIV:
    //     elmnt.addEventListener("mousedown", dragMouseDown);
    // }
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function useMove(event) {
    //$('.waiting').show();
    var moveName = event.data.move;
    console.log(moveName);
    if (currPoke.moves.find(function (x) { return x.name == moveName; }).pp <= 0) {
        console.log("you can't do that");
        return;
    }
    console.log("".concat(moveName, " was called"));
    if (moveUsed) {
        console.log("Move already sent");
        return;
    }
    moveUsed = true;
    var moveClass = moveName.replace(' ', '-');
    // When a Move is selected put a box around it
    var div = $(".".concat(moveClass));
    div.css('borderStyle', 'solid');
    div.css('borderWidth', '2px');
    div.css('borderColor', 'red');
    //console.log(data);
    sendMessage("selectedMove:" + moveName);
    var url = 'https://us-west1-ironmob.cloudfunctions.net/ChosenMove';
    var data = { selectedMove: moveName,
        timestamp: new Date().getTime(),
        token: atoken,
        pokemon: currPoke
    };
    //console.log(data);
    console.log("'" + JSON.stringify(data) + "'");
    fetch(url, {
        mode: 'no-cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(function (response) { return console.log(response); })["catch"](function (error) { return console.error('Error:', error); });
}
window.onload = function () {
    console.log("loaded");
    $('.waiting').hide();
    $('#pokeball-container').show();
    $('.primary').hide();
    //  updatePokemon(Dragonair);
};
var pokemon_max_moves = 4;
var pokemon_max_types = 2;
function resetCustomTags() {
    for (var x = 0; x <= pokemon_max_moves; x++) {
        $("#move".concat(x)).removeClass();
        $("#move".concat(x)).addClass('button');
        $("#move".concat(x, "-type")).removeClass();
        $("#move".concat(x, "-type")).addClass('type-icon');
        $("#move".concat(x)).off("click", useMove);
        $("#move".concat(x)).css({
            'borderStyle': '',
            'borderWidth': '',
            'borderColor': ''
        });
    }
    for (var t = 0; t < pokemon_max_types; t++) {
        $("#type".concat(t)).removeClass();
        $("#type".concat(t)).addClass('type-icon');
    }
}
function showPokeballGif() {
    document.getElementById("pokeball-image").style.display = "none";
    document.getElementById("pokeball-gif").style.display = "block";
}
function showPokeballStatic() {
    document.getElementById("pokeball-image").style.display = "block";
    document.getElementById("pokeball-gif").style.display = "none";
}
function hidePokeballText() {
    var pokeballText = document.getElementById("pokeball-text");
    pokeballText.style.display = "none";
}
var pokeballContainer = document.getElementById("pokeball-text");
pokeballContainer.addEventListener("click", hidePokeballText);
//   // Example function calls to switch images
//   showPokeballStatic(); // Initially show static image
//   setTimeout(showPokeballGif, 2000); // After 2 seconds, show animated image
var category_map = { "Special": "s", "Physical": "p", "Status": "t" };
var type_map = {
    "normal": "N",
    "fire": "F",
    "water": "W",
    "electric": "E",
    "grass": "G",
    "ice": "I",
    "fighting": "Fi",
    "poison": "P",
    "ground": "Gr",
    "flying": "Fl",
    "psychic": "Ps",
    "bug": "B",
    "rock": "R",
    "ghost": "Gh",
    "dragon": "D",
    "dark": "Da",
    "steel": "S",
    "fairy": "Fa" // "F" conflicts with Fire, "Fi" conflicts with Fighting
};
function encodePokemon(pokemon) {
    var stats = Object.values(pokemon.stats).join("-");
    var moves = pokemon.moves.map(function (move) { return [category_map[move.category], move.name, move.power, type_map[move.type], move.accuracy, move.pp].join(":"); });
    return [
        pokemon.uid,
        pokemon.nature,
        pokemon.curHP,
        pokemon.name,
        stats,
        pokemon.types.map(function (type) { return type_map[type]; }).join("|"),
        moves.join("|"),
        pokemon.ability
    ].join(",");
}
var condensedData = encodePokemon({
    "uid": "U135753687",
    "nature": "Hasty",
    "curHP": 33,
    "name": "Dragonair",
    "stats": {
        "atk": 20,
        "hp": 33,
        "def": 17,
        "spa": 15,
        "spe": 20,
        "spd": 11
    },
    "types": [
        "dragon",
        "fire"
    ],
    "moves": [
        {
            "category": "Special",
            "name": "Psych Up",
            "power": "90",
            "type": "normal",
            "accuracy": "0",
            "pp": 10
        },
        {
            "category": "Status",
            "name": "Fake Tears",
            "power": "0",
            "type": "dark",
            "accuracy": "100",
            "pp": 20
        },
        {
            "category": "Physical",
            "name": "Jump Kick",
            "power": "70",
            "type": "fighting",
            "accuracy": "95",
            "pp": 3
        },
        {
            "category": "Status",
            "name": "Conversion 2",
            "power": "0",
            "type": "normal",
            "accuracy": "0",
            "pp": 0
        }
    ],
    "ability": "Swift Swim"
});
console.log(condensedData); // U135753687,Hasty,33,Dragonair,20-33-17-15-20-11,dragon|fire,s:Psych Up:90:N:0:10|t:Fake Tears:0:Da:100:20|p:Jump Kick:70:Fi:95:3|t:Conversion 2:0:N:0:0,Swift Swim
var category_reverse = { "s": "Special", "p": "Physical", "t": "Status" };
var type_reverse = {
    "N": "normal",
    "F": "fire",
    "W": "water",
    "E": "electric",
    "G": "grass",
    "I": "ice",
    "Fi": "fighting",
    "P": "poison",
    "Gr": "ground",
    "Fl": "flying",
    "Ps": "psychic",
    "B": "bug",
    "R": "rock",
    "Gh": "ghost",
    "D": "dragon",
    "Da": "dark",
    "S": "steel",
    "Fa": "fairy"
};
function decodePokemon(data) {
    var _a = data.split(","), uid = _a[0], nature = _a[1], curHP = _a[2], name = _a[3], stats = _a[4], types = _a[5], moves = _a[6], ability = _a[7];
    return {
        uid: uid,
        nature: nature,
        curHP: parseInt(curHP),
        name: name,
        stats: Object.fromEntries(stats.split("-").map(function (stat, index) { return [["atk", "hp", "def", "spa", "spe", "spd"][index], stat]; })),
        types: types.split("|").map(function (type) { return type_reverse[type]; }),
        moves: moves.split("|").map(function (move) {
            var _a = move.split(":"), category = _a[0], name = _a[1], power = _a[2], type = _a[3], accuracy = _a[4], pp = _a[5];
            return { category: category_reverse[category], name: name, power: power === "0" ? power : parseInt(power), type: type_reverse[type], accuracy: accuracy === "0" ? parseInt(accuracy) : parseFloat(accuracy), pp: parseInt(pp) };
        }),
        ability: ability
    };
}
// Decode the previously encoded data (condensedData) as an example
var decodedPokemon = decodePokemon(condensedData);
console.log(decodedPokemon);
var chatDiv = document.querySelector('.twitch-chat');
var toggleButton = document.getElementById('toggle-chat');
var videoFrame = document.getElementById('twitch-video');
// Get the URL parameters
var urlParams = new URLSearchParams(window.location.search);
// Check if there's a "stream" parameter
// const stream = urlParams.get('stream');
// let streamUrl = "https://player.twitch.tv/?channel=drseil&parent=ironmob.live&autoplay=false";
// if (stream) {
// streamUrl = `https://player.twitch.tv/?channel=${stream}&parent=ironmob.live&autoplay=false`;
// }
// videoFrame.src = streamUrl;
toggleButton.addEventListener('click', function () {
    chatDiv.classList.toggle('hidden'); // Toggles 'hidden' class
});
var twitch_link_button = document.getElementById('twitch-link-button');
function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function encodeScope() {
    var scope = "user:read:chat user:write:chat";
    return encodeURIComponent(scope);
}
twitch_link_button.addEventListener('click', function () {
    var state = generateRandomString(16); // Change 16 to your desired string length
    var encodedScope = encodeScope();
    localStorage.setItem('state', state);
    var url = "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=nst9a3hi1iioqv1p75ph1cbx9oridg&redirect_uri=".concat(window.location.href, "&scope=").concat(encodedScope, "&state=").concat(state);
    window.location.href = url;
});
// Set button style (optional)
twitch_link_button.style.backgroundColor = "purple";
twitch_link_button.style.color = "white";
window.addEventListener('load', function () {
    var fragmentString = window.location.hash;
    // Remove the leading hash symbol (#)
    var fragmentParams = new URLSearchParams(fragmentString.substring(1));
    var accessToken = fragmentParams.get('access_token');
    var scope = fragmentParams.get('scope');
    var state = fragmentParams.get('state');
    var tokenType = fragmentParams.get('token_type');
    console.log('access_token:', accessToken);
    console.log('scope:', scope);
    console.log('state:', state);
    console.log('token_type:', tokenType);
    var storedState = localStorage.getItem('state');
    console.log(storedState);
    if (accessToken && state && state === storedState) {
        localStorage.setItem('access_token', accessToken);
        localStorage.removeItem('state'); // Remove state after successful use
        console.log('stored access token' + accessToken);
        processToken(accessToken);
    }
});
var client_id = 'nst9a3hi1iioqv1p75ph1cbx9oridg';
var redirect = window.location.origin + '/twitch_misc/';
var access_token = '';
var socket_space = '';
var session_id = '';
var my_user_id = '';
//ironmob_fanin  1068813693
//ironmob_fanout  1068814053
var fanout = "1068814053";
var fanin = "1068813693";
function addsimplelog(message) {
    console.log(message);
}
function log(message) {
    console.log(message);
}
if (document.location.hash && document.location.hash != '') {
    log('Checking for token');
    var parsedHash = new URLSearchParams(window.location.hash.slice(1));
    if (parsedHash.get('access_token')) {
        log('Got a token');
        processToken(parsedHash.get('access_token'));
    }
}
function processToken(token) {
    log('Got a token trying to get chats');
    access_token = token;
    twitch_link_button.style.display = 'none'; //remove link to avoid relinks....
    fetch('https://api.twitch.tv/helix/users', {
        "headers": {
            "Client-ID": client_id,
            "Authorization": "Bearer ".concat(access_token)
        }
    })
        .then(function (resp) { return resp.json(); })
        .then(function (resp) {
        console.log(resp);
        userId = "U" + resp.data[0].id;
        username = resp.data[0].display_name;
        socket_space = new initSocket(true);
        // and build schnanaigans
        socket_space.on('connected', function (id) {
            log("Connected to WebSocket with ".concat(id));
            session_id = id;
            my_user_id = resp.data[0].id;
            requestHooks(fanout, my_user_id);
            // extra/needed data
        });
        socket_space.on('session_silenced', function () {
            addsimplelog('Session mystery died due to silence detected');
        });
        socket_space.on('session_keepalive', function () {
            //console.log("keepalive")
        });
        socket_space.on('revocation', function (_a) {
            var payload = _a.payload;
            var event = payload.event, subscription = payload.subscription;
            //let { subscription_type, subscription_version } = event;
            var status = subscription.status, condition = subscription.condition, type = subscription.type;
            var broadcaster_user_id = condition.broadcaster_user_id;
            addsimplelog("On ".concat(broadcaster_user_id, " you were ").concat(status, " and ").concat(type, " was revoked"));
        });
        socket_space.on('channel.chat.message', function (_a) {
            var payload = _a.payload;
            var event = payload.event;
            var broadcaster_user_id = event.broadcaster_user_id, broadcaster_user_login = event.broadcaster_user_login, broadcaster_user_name = event.broadcaster_user_name;
            var chatter_user_id = event.chatter_user_id, chatter_user_login = event.chatter_user_login, chatter_user_name = event.chatter_user_name;
            var message_id = event.message_id, message = event.message, reply = event.reply;
            var text = message.text, fragments = message.fragments;
            if (chatter_user_name == "backtothelabbot") {
                console.log("backtothelabbot detected");
                console.log("text");
                if (text.startsWith("pkmn;")) {
                    // Split the data into parts using ';' as delimiter
                    var pokemon = text.slice(5); // Remove "pkmn;" and split by ','
                    var decoded_pokemon = (decodePokemon(pokemon));
                    console.log(decoded_pokemon);
                    if (decoded_pokemon.uid == username || decoded_pokemon.uid == "chat") {
                        updatePokemon(decoded_pokemon);
                        ensureDivVisibility(document.getElementById("moveable"));
                    }
                }
                else if (text.startsWith('nts;')) {
                    var trainer = text.slice(4);
                    var trainer_list = trainer.split(",");
                    var trainer_index = trainer_list.indexOf(username);
                    console.log(trainer_list);
                    console.log(username);
                    console.log(trainer_index);
                    if (trainer_index > 0) {
                        readyText.textContent = "You are one of the next " + (trainer_list.length) + " trainers";
                    }
                    else if (trainer_index == 0 && $('.primary').css('display') != 'block') {
                        readyText.textContent = "You are the next trainer";
                    }
                    else {
                        readyText.textContent = "";
                    }
                }
                else if (text.startsWith('clear;')) {
                    $('.primary').css("display", "none");
                    $('.waiting').hide();
                    readyText.textContent = "";
                }
                else if (text.startsWith('ready;')) {
                    var text_split = text.slice(6).split(',');
                    var trainer = text_split[0];
                    var num_trainers = parseInt(text_split[1]);
                    var msg_countdown = parseInt(text_split[2]);
                    if (trainer == username) {
                        if (countdown > 0) {
                            console.log("Countdown already triggered");
                        }
                        else {
                            console.log(countdownDiv);
                            countdownDiv.style.display = "block";
                            trainersCount = num_trainers;
                            countdown = msg_countdown;
                            updateCountdown();
                        }
                    }
                }
                else if (text.startsWith('rival;')) {
                    var rival_moves_count = JSON.parse(text.slice(6));
                    console.log(rival_moves_count);
                    updateRivalMoves(rival_moves_count);
                }
            }
            console.log(message);
            console.log(event);
        });
    })["catch"](function (err) {
        console.log(err);
        log('Error with Users Call');
    });
}
function requestHooks(broadcaster_user_id, user_id) {
    var topics = {
        'channel.chat.message': { version: "1", condition: { broadcaster_user_id: broadcaster_user_id, user_id: user_id } }
    };
    log("Spawn Topics for ".concat(user_id));
    var _loop_1 = function (type) {
        log("Attempt create ".concat(type, " - ").concat(broadcaster_user_id, " via ").concat(user_id));
        var _a = topics[type], version = _a.version, condition = _a.condition;
        fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            "method": "POST",
            "headers": {
                "Client-ID": client_id,
                "Authorization": "Bearer ".concat(access_token),
                'Content-Type': 'application/json'
            },
            "body": JSON.stringify({
                type: type,
                version: version,
                condition: condition,
                transport: {
                    method: "websocket",
                    session_id: session_id
                }
            })
        })
            .then(function (resp) { return resp.json(); })
            .then(function (resp) {
            if (resp.error) {
                log("Error with eventsub Call ".concat(type, " Call: ").concat(resp.message ? resp.message : ''));
            }
            else {
                log("Created ".concat(type));
            }
        })["catch"](function (err) {
            console.log(err);
            log("Error with eventsub Call ".concat(type, " Call: ").concat(err.message ? err.message : ''));
        });
    };
    for (var type in topics) {
        _loop_1(type);
    }
}
var message = "Hello, world! twitchdevHype";
function sendMessage(message) {
    var url = 'https://api.twitch.tv/helix/chat/messages';
    var accessToken = localStorage.getItem('access_token');
    var data = {
        broadcaster_id: fanin,
        sender_id: my_user_id,
        message: message
    };
    console.log(data);
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': "Bearer ".concat(accessToken),
            'Client-Id': client_id,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        console.log('Response:', data);
    })["catch"](function (error) {
        console.error('Error:', error);
    });
}
