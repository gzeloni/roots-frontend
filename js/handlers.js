let lastId = 0;

function handle_action(player, input) {
    var commands = {
        "move": move
    }
    var cmd = input.split(" ")[0];
    var param = input.split(" ")[1];
    if (cmd in commands) {
        commands[cmd](player, param)
    }
}


function handle_combat(player, input) {
    console.log("Not implemented");
}


function handle_say(player, input, id) {
    send_chat_command(player, input.trim(), id);
}


function command() {
    var command_input = document.getElementById('command_input').value;
    var handlers = {
        "/": handle_action,
        ">": handle_combat,
        "+": handle_say
    }
    var prefix = command_input[0];
    var user = localStorage.getItem('char_name');

    if (prefix in handlers) {
        handlers[prefix](user, command_input.replace(prefix, ""));
    }
}



// Gambiarra para fim de testes
function moveup() {
    var user = localStorage.getItem('char_id');
    handle_action(user, 'move up');
}
function movedown() {
    var user = localStorage.getItem('char_id');
    handle_action(user, 'move down');
}
function moveleft() {
    var user = localStorage.getItem('char_id');
    handle_action(user, 'move left');
}
function moveright() {
    var user = localStorage.getItem('char_id');
    handle_action(user, 'move right');
}


function move_to_direction(nx, ny) {

    if (nx > upperBuffer.width){
        return
    }
    if (ny > upperBuffer.height){
        return
    }

    let player_character = players[localStorage.getItem('char_id')];
    let cx = player_character.x;
    let cy = player_character.y;
    let x;
    let y;
    if (nx > cx) { x = cx + 28; }
    if (ny > cy) { y = cy + 28; }
    if (nx < cx) { x = cx - 28; }
    if (ny < cy) { y = cy - 28; }

    if (x > upperBuffer.width || x < 0){
        return
    }
    if (y > upperBuffer.height || y < 0){
        return
    }

    update_position(player_character.id, x, y);
  }
  


function send_message() {
    var message_input = document.getElementById('message_input').value;
    var user = localStorage.getItem('username');
    var id = lastId + 1
    lastId = id
    handle_say(user, message_input, id);
    $("#message_input").val('')
}

