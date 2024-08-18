
// Twitch stuff probably won't work localy, just mock atoken and userid
var atoken, userId, username, currPoke, moveUsed;


const countdownDiv = document.getElementById("countdown-div");
const countdownText = document.getElementById("countdown-text");
const readyUpButton = document.getElementById("ready-up");
const skipMeButton = document.getElementById("skip-me");
const defaultCountdownText = "You are one of the next X trainers, please ready up within the next YY seconds"
const readyText = document.getElementById("ready-text")

function ensureDivVisibility(divElement, containerElement = window) {
    // Get element and container dimensions
    const elementRect = divElement.getBoundingClientRect();
  
    // Check if element is fully visible within container
    const isFullyVisible = (
      elementRect.top >= 0 &&
      elementRect.right <= window.innerWidth &&
      elementRect.bottom <= window.innerHeight &&
      elementRect.left >= 0
    );
    console.log(elementRect)
    // If not fully visible, adjust position
    if (!isFullyVisible) {
  
      // Apply adjustments to the element's style
      divElement.style.top = `10px`;
      divElement.style.left = `10px`;
    }
  }

function handleWhisper(message){
    if(message.hasOwnProperty("readyup"))
    {
        console.log(message)
        if(trainer_countdown > 0){
            console.log("Countdown already triggered")
        }else {
            console.log(countdownDiv)
            countdownDiv.style.display = "block";
            trainersCount = message.num_trainers;
            trainer_countdown = message.countdown;
            updateCountdown();
        }
    }
    else{
        readyText.textContent = ""
        updatePokemon(message);
        ensureDivVisibility(document.getElementById("moveable"))
    }
}



let trainer_countdown = -1; // Initial countdown value
let trainersCount = 3; // Initial X value

function updateCountdown() {
  if (trainer_countdown > 0) {
    countdownText.textContent = defaultCountdownText.replace(/YY/g, trainer_countdown).replace(/X/g, trainersCount);
    trainer_countdown--;
    setTimeout(updateCountdown, 1000);
  } else {
    // Call your function here when countdown reaches 0
    countdownFinished();
  }
}

function countdownFinished() {
  countdownDiv.style.display = "none"; // Hide the div
  trainer_countdown = -1;
  // Perform any other actions needed when countdown is finished
}


// Event listeners for buttons
readyUpButton.addEventListener("click", () => {
    countdownFinished();
    sendMessage("I'm ready")
});

skipMeButton.addEventListener("click", () => {
    countdownFinished();
    sendMessage("Skip Me")
});

function checkChatter(chatter_list){
    console.log(username)
    console.log(chatter_list)
    console.log(chatter_list.includes(username))
    if (chatter_list.includes(username)) {
        showPokeballGif()
    }
    else{
        showPokeballStatic()
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
    var rival_countdown = rival_moves_count.countdown
    delete rival_moves_count.countdown
    for (let moveName in rival_moves_count) {
        // Check if the move name matches the value of any of your elements
        for (let i = 0; i <= 3; i++) { // Assuming i starts from 1 and goes up to 4
          if ($(`#move${i}`).val() === moveName) {
            console.log(`Move with name "${moveName}" is associated with element #move${i}`);
            const moveCount = rival_moves_count[moveName];

            // Check if the #move${i}-count element exists
            const moveCountElement = $(`#move${i}-count`);
            if (!moveCountElement.length) {
              // If it doesn't exist, create it and append it to the #move${i}-category section
              $(`#move${i}-category`).append(`<span id="move${i}-count">${moveCount}</span>`);
            } else {
              // If it exists, update the value
              moveCountElement.text(moveCount);
            }            break; // Exit the inner loop once a match is found for this moveName
          }
        }
      }

}


function updatePokemon(pokemon) {
    console.log(pokemon)
    resetCustomTags();

    // In theory the "moveable" tag should be able to be dragged around a webpage, I was hoping users could move the extension to where they want it to be.
    $('.primary').css("display", "block");
    $('.waiting').hide();

    currPoke = pokemon;
    moveUsed = false;
    $('#name').text(pokemon.name);

    var types = pokemon.types.filter(Boolean);
    for (let t = 0; t < types.length; t++)
    {
        $(`#type${t}`).addClass(`type-${types[t]}`);
        $(`#type${t}`).text(types[t]);
    }
    if (types.length != 2)
    {
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
        var moveDetails = `Category: ${move.category}, Power: ${move.power}, Type: ${move.type}, Accuracy: ${move.accuracy}, PP: ${move.pp}`;
        var buttonColor = '#a5ffa8';
        var isDisabled = (move.pp <= 0 || (pokemon.uid !== username && pokemon.uid !== 'chat'));
        var moveCategory = '';
        if (move.category == 'Physical'){
            moveCategory = '<img src="move-physical.png" alt="Physical" />'
        } else if (move.category == 'Status') {
            moveCategory = '<img src="move-status.png" alt="Status" />'
        } else if (move.category == 'Special') {
            moveCategory = '<img src="move-special.png" alt="Special" />'
        }

        // uid is sent to say which twitch user should be allowed to click the buttons.
        if(pokemon.uid !== username && pokemon.uid !== 'chat' ) {
            buttonColor = '#555753';
        }
        else if (move.pp < 5 && move.pp > 0) {
            buttonColor = '#fffd87';
        }
        else if (move.pp === 0) {
            buttonColor = '#fc7c7c';
        }

        let moveClass = move.name.replace(' ', '-');


        $(`#move${i}`).prop('title', moveDetails);
        $(`#move${i}`).prop('disabled', isDisabled);
        $(`#move${i}`).val(move.name);
        // $(`#move${i}`).removeClass();
        // $(`#move${i}`).addClass('button');
        $(`#move${i}`).addClass(moveClass);
        $(`#move${i}`).css('background-color', buttonColor);

        $(`#move${i}-name`).text(move.name);
        $(`#move${i}-category`).html(moveCategory);
        // $(`#move${i}-type`).removeClass();
        // $(`#move${i}-type`).addClass('move-type')
        $(`#move${i}-type`).addClass(`type-${move.type}`);
        $(`#move${i}-type`).text(move.type);
        $(`#move${i}-power`).text(move.power);
        $(`#move${i}-pp`).text(move.pp);
        $(`#move${i}`).off("click",  useMove);

        $(`#move${i}`).on("click", {move: $(`#move${i}`).val()}, useMove);
    }
    
    $('.waiting').hide();
}

//This is some code I found online to move a div around.  haven't been able to verify it works in the extension yet.
dragElement(document.getElementById("moveable"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    console.log("#" + elmnt.id + "header")
    $("#pokeball-image").on('mousedown',dragMouseDown);
    $("#pokeball-gif").on('mousedown',dragMouseDown);
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
    let moveName = event.data.move;
    console.log(moveName)
    let move_pp = currPoke.moves.find(x => x.name == moveName).pp 
    if (move_pp <= 0)
    {
        console.log("you can't do that");
        return;
    }
    console.log(`${moveName} was called`);
    if(moveUsed)
    {
        console.log("Move already sent")
        return;
    }
    moveUsed = true;
    let moveClass = moveName.replace(' ', '-');
    
    // When a Move is selected put a box around it
    let div = $(`.${moveClass}`)
    div.css('borderStyle','solid');
    div.css('borderWidth','2px');
    div.css('borderColor', 'red');




    //console.log(data);
    sendMessage("selectedMove:"+moveName +":"+Math.random())

    let url = 'https://us-west1-ironmob.cloudfunctions.net/ChosenMove';
    let data = { selectedMove: moveName, 
        timestamp: new Date().getTime(),
    token: atoken,
    pokemon: currPoke   
    };
//console.log(data);
    console.log("'"+JSON.stringify(data)+"'",)
      fetch(url, {
          mode: 'no-cors',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
        body: JSON.stringify(data),
      })
    .then(response => console.log(response))
    //.then(data => console.log(data))
    .catch((error) => console.error('Error:', error));

}
window.onload = function () {

    console.log("loaded");
    $('.waiting').hide();
    $('#pokeball-container').show();
    $('.primary').hide();
  //  updatePokemon(Dragonair);
}
const pokemon_max_moves = 4;
const pokemon_max_types = 2;
function resetCustomTags() {
    for (let x = 0; x <= pokemon_max_moves; x++) {
        $(`#move${x}`).removeClass();
        $(`#move${x}`).addClass('button');
        $(`#move${x}-type`).removeClass();
        $(`#move${x}-type`).addClass('type-icon')
        $(`#move${x}`).off("click",  useMove);
        $(`#move${x}`).css({
            'borderStyle':'',
            'borderWidth':'',
            'borderColor': ''
        });
    }
    for (let t = 0; t < pokemon_max_types; t++)
    {
        $(`#type${t}`).removeClass();
        $(`#type${t}`).addClass('type-icon');
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
    const pokeballText = document.getElementById("pokeball-text");
    pokeballText.style.display = "none";
  }
  
  const pokeballContainer = document.getElementById("pokeball-text");
  pokeballContainer.addEventListener("click", hidePokeballText);
//   // Example function calls to switch images
//   showPokeballStatic(); // Initially show static image
//   setTimeout(showPokeballGif, 2000); // After 2 seconds, show animated image


const category_map = {"Special" : "s","Physical":"p","Status":"t"};
    const type_map = {
  "normal": "N",
  "fire": "F",
  "water": "W",
  "electric": "E",
  "grass": "G",
  "ice": "I",
  "fighting": "Fi",  // "F" conflicts with Fire
  "poison": "P",
  "ground": "Gr",  // "G" conflicts with Grass
  "flying": "Fl",  // "F" conflicts with Fire
  "psychic": "Ps",  // "P" conflicts with Poison
  "bug": "B",
  "rock": "R",
  "ghost": "Gh",  // "G" conflicts with Grass
  "dragon": "D",  // "D" is unique
  "dark": "Da",  // "D" conflicts with Dragon
  "steel": "S",
  "fairy": "Fa"   // "F" conflicts with Fire, "Fi" conflicts with Fighting
}

function encodePokemon(pokemon) {
  const stats = Object.values(pokemon.stats).join("-");
  const moves = pokemon.moves.map(move => [category_map[move.category], move.name,move.power,type_map[move.type],move.accuracy,move.pp].join(":"));
  return [
    pokemon.uid,
    pokemon.nature,
    pokemon.curHP,
    pokemon.name,
    stats,
    pokemon.types.map(type=>{return type_map[type]}).join("|"),
    moves.join("|"),
    pokemon.ability
  ].join(",");
}

const condensedData = encodePokemon({
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

console.log(condensedData) // U135753687,Hasty,33,Dragonair,20-33-17-15-20-11,dragon|fire,s:Psych Up:90:N:0:10|t:Fake Tears:0:Da:100:20|p:Jump Kick:70:Fi:95:3|t:Conversion 2:0:N:0:0,Swift Swim

const category_reverse = {"s" : "Special","p":"Physical","t":"Status"};
const type_reverse = {  // Inverted mapping for decoding type codes
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
}

function decodePokemon(data) {
  const [uid, nature, curHP, name, stats, types, moves, ability] = data.split(",");
  return {
    uid,
    nature,
    curHP: parseInt(curHP),
    name,
    stats: Object.fromEntries(stats.split("-").map((stat, index) => [["atk", "hp", "def", "spa", "spe", "spd"][index], stat])),
    types: types.split("|").map(type => {return type_reverse[type]}),
    moves: moves.split("|").map(move => {
      const [category, name, power, type, accuracy, pp] = move.split(":");
      return { category: category_reverse[category], name, power: power === "0" ? power : parseInt(power), type: type_reverse[type], accuracy: accuracy === "0" ? parseInt(accuracy) : parseFloat(accuracy), pp: parseInt(pp) };
    }),
    ability
  };
}

// Decode the previously encoded data (condensedData) as an example
const decodedPokemon = decodePokemon(condensedData);

console.log(decodedPokemon)


const chatDiv = document.querySelector('.twitch-chat');
const toggleButton = document.getElementById('toggle-chat');
const videoFrame = document.getElementById('twitch-video');

// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);

// Check if there's a "stream" parameter
// const stream = urlParams.get('stream');

// let streamUrl = "https://player.twitch.tv/?channel=drseil&parent=ironmob.live&autoplay=false";
// if (stream) {
// streamUrl = `https://player.twitch.tv/?channel=${stream}&parent=ironmob.live&autoplay=false`;
// }

// videoFrame.src = streamUrl;

toggleButton.addEventListener('click', function() {
  chatDiv.classList.toggle('hidden');  // Toggles 'hidden' class
});
const twitch_link_button = document.getElementById('twitch-link-button');

function generateRandomString(length) {
let text = "";
const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
}
return text;
}

function encodeScope() {
const scope = "user:read:chat user:write:chat";
return encodeURIComponent(scope);
}

twitch_link_button.addEventListener('click', function() {
const state = generateRandomString(16); // Change 16 to your desired string length
const encodedScope = encodeScope();
localStorage.setItem('state',state);

const url = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=nst9a3hi1iioqv1p75ph1cbx9oridg&redirect_uri=${window.location.href}&scope=${encodedScope}&state=${state}`;
window.location.href = url;
});

// Set button style (optional)
twitch_link_button.style.backgroundColor = "purple";
twitch_link_button.style.color = "white";

window.addEventListener('load', function() {
    const fragmentString = window.location.hash;

// Remove the leading hash symbol (#)
    const fragmentParams = new URLSearchParams(fragmentString.substring(1));

    const accessToken = fragmentParams.get('access_token');
    const scope = fragmentParams.get('scope');
    const state = fragmentParams.get('state');
    const tokenType = fragmentParams.get('token_type');

    console.log('access_token:', accessToken);
    console.log('scope:', scope);
    console.log('state:', state);
    console.log('token_type:', tokenType);

const storedState = localStorage.getItem('state');
console.log(storedState)
if (accessToken && state && state === storedState) {
    localStorage.setItem('access_token', accessToken);
    localStorage.removeItem('state'); // Remove state after successful use
    console.log('stored access token' + accessToken)
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
const fanout = "1068814053";
const fanin = "1068813693";
function addsimplelog(message) {
        console.log(message)
    }
function log(message) {
        
        console.log( message);
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
    log('Got a token trying to get chats')
        access_token = token;

        twitch_link_button.style.display = 'none';//remove link to avoid relinks....

        fetch(
            'https://api.twitch.tv/helix/users',
            {
                "headers": {
                    "Client-ID": client_id,
                    "Authorization": `Bearer ${access_token}`
                }
            }
        )
            .then(resp => resp.json())
            .then(resp => {
                console.log(resp)
                userId = "U" + resp.data[0].id
                username = resp.data[0].display_name
                socket_space = new initSocket(true);
                // and build schnanaigans
                socket_space.on('connected', (id) => {
                    log(`Connected to WebSocket with ${id}`);
                    session_id = id;
                    my_user_id = resp.data[0].id;

                    requestHooks(fanout, my_user_id);

                    // extra/needed data
                });

                socket_space.on('session_silenced', () => {
                    addsimplelog('Session mystery died due to silence detected');
                });
                socket_space.on('session_keepalive', () => {
                    //console.log("keepalive")
                });
                socket_space.on('revocation', ({ payload }) => {
                    let { event, subscription } = payload;
                    //let { subscription_type, subscription_version } = event;
                    let { status, condition, type } = subscription;
                    let { broadcaster_user_id } = condition;

                    addsimplelog(`On ${broadcaster_user_id} you were ${status} and ${type} was revoked`);
                });



                socket_space.on('channel.chat.message', ({ payload }) => {
                    let { event } = payload;

                    let { broadcaster_user_id, broadcaster_user_login, broadcaster_user_name } = event;
                    let { chatter_user_id, chatter_user_login, chatter_user_name } = event;
                    let { message_id, message, reply } = event;

                    let { text, fragments } = message;

                    if ( chatter_user_name == "backtothelabbot") {
                        console.log("backtothelabbot detected")
                        console.log("text")
                        if (text.startsWith("pkmn;") ) {
                            // Split the data into parts using ';' as delimiter
                            const pokemon = text.slice(5); // Remove "pkmn;" and split by ','
                            const decoded_pokemon = (decodePokemon(pokemon))
                            console.log(decoded_pokemon)
                            if(decoded_pokemon.uid == username || decoded_pokemon.uid == "chat") {
                                updatePokemon(decoded_pokemon)
                                ensureDivVisibility(document.getElementById("moveable"))

                            }
                        } else if (text.startsWith('nts;')) {
                            const trainer = text.slice(4);
                            const trainer_list = trainer.split(",")
                            const trainer_index = trainer_list.indexOf(username)
                            console.log(trainer_list)
                            console.log(username)
                            console.log(trainer_index)
                            if(trainer_index > 0){
                                readyText.textContent = "You are one of the next " +(trainer_list.length) + " trainers"
                            }else if (trainer_index == 0 && $('.primary').css('display') != 'block') {
                                readyText.textContent = "You are the next trainer"
                            } else {
                                readyText.textContent = ""
                            }
                        } else if (text.startsWith('clear;')) {
                            $('.primary').css("display", "none");
                            $('.waiting').hide();
                            readyText.textContent = ""

                        }
                        else if (text.startsWith('ready;'))
                        {
                            const text_split = text.slice(6).split(',');
                            const trainer = text_split[0]
                            const num_trainers = parseInt(text_split[1])
                            const msg_countdown = parseInt(text_split[2])
                            if (trainer == username)
                                {
                                if(trainer_countdown > 0){
                                    console.log("Countdown already triggered")
                                }else {
                                    console.log(countdownDiv)
                                    countdownDiv.style.display = "block";
                                    trainersCount = num_trainers
                                    trainer_countdown = msg_countdown
                                    updateCountdown();
                                }
                            }
                         }
                         else if (text.startsWith('rival;')){
                            const rival_moves_count = JSON.parse(text.slice(6))
                            console.log(rival_moves_count)
                            updateRivalMoves(rival_moves_count)
                         }

                    }


                    console.log(message)
                    console.log(event)
                });


            })
            .catch(err => {
                console.log(err);
                log('Error with Users Call');
            });
    }



    function requestHooks(broadcaster_user_id, user_id) {
        let topics = {

            'channel.chat.message': { version: "1", condition: { broadcaster_user_id, user_id } },

        }

        log(`Spawn Topics for ${user_id}`);

        for (let type in topics) {
            log(`Attempt create ${type} - ${broadcaster_user_id} via ${user_id}`);
            let { version, condition } = topics[type];

            fetch(
                'https://api.twitch.tv/helix/eventsub/subscriptions',
                {
                    "method": "POST",
                    "headers": {
                        "Client-ID": client_id,
                        "Authorization": `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    },
                    "body": JSON.stringify({
                        type,
                        version,
                        condition,
                        transport: {
                            method: "websocket",
                            session_id
                        }
                    })
                }
            )
                .then(resp => resp.json())
                .then(resp => {
                    if (resp.error) {
                        log(`Error with eventsub Call ${type} Call: ${resp.message ? resp.message : ''}`);
                    } else {
                        log(`Created ${type}`);
                    }
                })
                .catch(err => {
                    console.log(err);
                    log(`Error with eventsub Call ${type} Call: ${err.message ? err.message : ''}`);
                });
        }
    }

const message = "Hello, world! twitchdevHype";


function sendMessage(message){
    const url = 'https://api.twitch.tv/helix/chat/messages';
    const accessToken =  localStorage.getItem('access_token');


    const data = {
    broadcaster_id: fanin,
    sender_id: my_user_id,
    message: message
    };
    console.log(data)
    fetch(url, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': client_id,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
    console.log('Response:', data);
    })
    .catch(error => {
    console.error('Error:', error);
    });

}

    