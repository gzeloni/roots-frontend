var upperBuffer;
var lowerBuffer;
var character_sprite;
var enemy_sprite;
var images = {};
var players = {};
var enemies = {};

let targeting = false;
let target = null;
let target_class_type = null;
let respawn_menu;



function checkCollision(object_1, object_2) {
    // Get distances between the objects    
    let distanceVect = p5.Vector.sub(object_2, object_1);

    // Calculate magnitude of the vector separating the objects
    let distanceVectMag = distanceVect.mag();

    // Minimum distance before they are touching
    let minDistance = 48;

    if (distanceVectMag < minDistance) {
      return true;
    }
    return false;
}


function AreaTransferCallback(){
    let char = players[localStorage.getItem('char_id')];
    let char_vec = new p5.Vector(char['sprite'].x, char['sprite'].y);
    let pointer_vec = new p5.Vector(this.x, this.y);
    if (checkCollision(char_vec, pointer_vec)){
        let input_data = `{ id: ${char['id']} areaName: \\\"${this.elt.value}\\\" }`;
        character_area_transfer_mutation(input_data).then(data => {
            if (data['id'] == char['id']){
                localStorage.setItem('char_location', data['areaLocation']);
                localStorage.setItem('map_size_x', data['mapMetadata']['sizeX']);
                localStorage.setItem('map_size_y', data['mapMetadata']['sizeY']);
                window.location.href = 'game.html';
            }
        });
    }
}


function TargetCallback() {
    // Enemy class type target
    if (this.elt.class_type == 'enemy' && this.elt.id in enemies){
        targeting = true;
        // If already targeting an enemy
        if (target != this.elt.id && target != null){
            // untarget current targeted enemy
            if (target_class_type == 'enemy'){
                // enemies[target]['sprite'].elt.border = '';
                enemies[target]['hud'].hide();
                enemies[target]['hud_label'].hide();
            }
            else {
                // players[target]['sprite'].elt.border = '';
                players[target]['hud'].hide();
                players[target]['hud_label'].hide();
            }
            target_class_type = 'enemy';

            // refresh target variable with new target id
            target = this.elt.id;

            // Targets the new target enemy
            // this.elt.border = '5px solid #555';
            enemies[target]['hud'].show();
            enemies[target]['hud_label'].show();

        }
        else {
            target = this.elt.id;
            // this.elt.border = '5px solid #555';
            enemies[target]['hud'].show();
            enemies[target]['hud_label'].show();
            target_class_type = 'enemy';
        }
    }
    // player target
    else if (this.elt.id in players && this.elt.class_type == 'player'){
        targeting = true;
        // If already targeting a player
        if (target != this.elt.id && target != null){
            // untarget current target
            if (target_class_type == 'enemy'){
                // enemies[target]['sprite'].elt.border = '';
                enemies[target]['hud'].hide();
                enemies[target]['hud_label'].hide();
            }
            else {
                // players[target]['sprite'].elt.border = '';
                players[target]['hud'].hide();
                players[target]['hud_label'].hide();
            }
            target_class_type = 'player';

            // refresh target variable with new target id
            target = this.elt.id;

            // Targets the new target player
            // this.elt.border = '5px solid #555';
            players[target]['hud'].show();
            players[target]['hud_label'].show();
        }
        else {
            target = this.elt.id;
            // this.elt.border = '5px solid #555';
            players[target]['hud'].show();
            players[target]['hud_label'].show();
            target_class_type = 'player';
        }
    }
}


function LogoutCallback(){
    send_logout_request();
}

function RespawnCallback(){
    console.log('a')
    let respawn_area = localStorage.getItem('char_location');
    let char_id = localStorage.getItem('char_id');
    let input_data = `{id: ${char_id} areaLocation: \\\"${respawn_area}\\\"}`
    respawn_mutation(input_data).then(response => {
        console.log(response)
        if (response['id'] == char_id){
            localStorage.setItem('is_ko', response['isKo']);
            localStorage.setItem('max_hp', data['maxHp']);
            localStorage.setItem('max_sp', data['maxHp']);
            localStorage.setItem('current_hp', data['currentHp']);
            localStorage.setItem('current_sp', data['currentHp']);

            respawn_menu['box_menu'].remove();
            respawn_menu['respawn_button'].remove();
            respawn_menu['logout_button'].remove();

            window.location.href = 'game.html';
        }
    })
}


function set_spawned_enemies(data){
    data = data['enemiesSpawned'];
    let current_area = localStorage.getItem('char_location');
    enemies = {};
    for (let i = 0; i < data.length; i++) {
        if (data[i]['isKo'] == false && data[i]['areaLocation'] == current_area){
            let enemy_data = {
                "lv": data[i]['lv'],
                "name": data[i]['name'],
                "x": data[i]['positionX'],
                "y": data[i]['positionY'],
                "sprite": createImg(
                    images[data[i]['name'] + '_down'],
                    data[i]['name']
                ),
                "id": data[i]['id'],
                'class_type': data[i]['classType'],
                "is_ko": data[i]['isKo'],
                'current_hp': data[i]['currentHp'],
                "area": data[i]['areaLocation']
            }
            enemy_data['sprite'].elt.id = data[i]['id'];
            enemy_data['sprite'].elt.class_type = data[i]['classType'];
            enemy_data['sprite'].position(data[i]['positionX'], data[i]['positionY']);
            enemy_data['sprite'].mouseClicked(TargetCallback);

            enemy_data['hud'] = createElement("progress", 'TGT');
            enemy_data['hud'].elt.id = data[i]['name'] + ':' + data[i]['id'];
            enemy_data['hud'].elt.value = data[i]['currentHp'];
            enemy_data['hud'].elt.max = data[i]['maxHp'];
            enemy_data['hud'].position(data[i]['positionX']-54, data[i]['positionY']-16);
            enemy_data['hud_label'] = createElement('label', `Lv: ${data[i]['lv']} ` + data[i]['name']);
            enemy_data['hud_label'].elt.for = enemy_data['hud'].elt.id;
            enemy_data['hud_label'].position(data[i]['positionX'], data[i]['positionY']-20);
            enemy_data['hud'].hide();
            enemy_data['hud_label'].hide();

            enemies[data[i]['id']] = enemy_data;
        }
    }
}


function set_players(data) {
    data = data['characters'];
    players = {};
    for (let i = 0; i < data.length; i++) {
        if (data[i]['isLogged'] == true) {
            let state_sprite;
            if (data[i]['isKo']){
                state_sprite = images['ko_character'];
            }
            else {
                state_sprite = images['character_' + data[i]['classType'] + '_down'];
            }
            let player_data = {
                "name": data[i]['name'],
                "x": data[i]['positionX'],
                "y": data[i]['positionY'],
                "sprite": createImg(
                    state_sprite,
                    data[i]['name']
                ),
                "id": data[i]['id'],
                'class_type': data[i]['classType'],
            }
            player_data['sprite'].elt.id = data[i]['id'];
            player_data['sprite'].elt.class_type = 'player';
            player_data['sprite'].position(data[i]['positionX'], data[i]['positionY']);
            player_data['sprite'].mouseClicked(TargetCallback);

            player_data['hud'] = createElement("progress", 'TGT');
            player_data['hud'].elt.id = data[i]['name'] + ':' + data[i]['id'];
            player_data['hud'].elt.value = data[i]['currentHp'];
            player_data['hud'].elt.max = data[i]['maxHp'];
            player_data['hud_label'] = createElement('label', `Lv: ${data[i]['lv']} ` + data[i]['name']);
            player_data['hud_label'].elt.for = player_data['hud'].elt.id ;
            player_data['hud'].position(data[i]['positionX']-64, data[i]['positionY']-18);
            player_data['hud_label'].position(data[i]['positionX'], data[i]['positionY']-22);
            player_data['hud'].hide();
            player_data['hud_label'].hide();

            players[data[i]['id']] = player_data;
        }
    }
}


function get_players(map_area) {
    query_logged_characters(map_area).then((data) => {
        set_players(data);
    });
};


function draw_upper_buffer() {
    // upperBuffer.background(images['forest_bg']);
    upperBuffer.background(images[localStorage.getItem('char_location')]);
}


function ListMessage() {
    var name;
    var msg;
    var idMessage;

    for (let i = 0; i < chat_logs.length; i++) {
        name = chat_logs[i]['sender'];
        msg = chat_logs[i]['text'];
        idMessage = chat_logs[i]['id'];

        $(`#${idMessage}`).remove();
        InjectMessageInChat(idMessage, name, msg)

    };
}


function InjectMessageInChat(idMessage, name, msg) {
    console.log("msg", msg)
    var html = $(`<li class="list-group-item" id="${idMessage}">${name}: ${msg}</li>`)
    $("#ulMessage").append(html[0])
}


function MountedLayoutSkill() {
    const skillsPlayer = JSON.parse(localStorage.getItem('skills'))
    if (skillsPlayer != undefined) {
        const canvas = $("#defaultCanvas0")
        $("#skills").css("width", `${canvas.outerWidth()}`).css("display", 'block')
        skillsPlayer.forEach(x => {
            console.log(x)
            var html = $(
                `<button type="button" class="btn btn-outline-dark" data-toggle="tooltip" data-html="true" data-placement="bottom"
                title="<span class='badge badge-danger'>Power: ${x.power}</span> <span class='badge badge-info'>Range: ${x.range}</span> <span class='badge badge-warning'>Cost: ${x.spCost}</span>"
                ">${x.name}</button>`);

            $("#skills").children()[0].append(html[0])
        });
    }
}


function MountedLayoutChat() {
    const canvas = $("#defaultCanvas0")
    $("#chat").css("height", `${canvas.outerHeight()}`).css("display", 'block').css("border-radius", '0px')

}


function preload() {
    // K.O
    images['ko_character'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/states/ko.png';

    // DPS Sprites
    images['character_dps_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/dps_right.png';
    images['character_dps_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/dps_left.png';
    images['character_dps_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/dps_back.png';
    images['character_dps_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/dps_front.png';

    // SUPPORTER Sprites
    images['character_supporter_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/supporter_right.png';
    images['character_supporter_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/supporter_left.png';
    images['character_supporter_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/supporter_back.png';
    images['character_supporter_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/supporter_front.png';

    // TANKER Sprites
    images['character_tanker_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/tanker_right.png';
    images['character_tanker_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/tanker_left.png';
    images['character_tanker_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/tanker_back.png';
    images['character_tanker_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/characters/tanker_front.png';

    // ENEMY Sprites

    // Spider
    images['spider_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/spider_front.png';
    images['spider_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/spider_back.png';
    images['spider_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/spider_right.png';
    images['spider_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/spider_left.png';

    // Wolf
    images['wolf_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/wolf_front.png';
    images['wolf_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/wolf_back.png';
    images['wolf_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/wolf_right.png';
    images['wolf_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/wolf_left.png';

    // Goblin
    images['goblin_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/goblin_front.png';
    images['goblin_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/goblin_back.png';
    images['goblin_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/goblin_right.png';
    images['goblin_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/enemies/goblin_left.png';

    // Background area sprites
    images['forest_bg'] = loadImage('https://i.postimg.cc/nhKGBvtK/Map002480.png')

    // Citadel
    images['citadel_central_area'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/citadel_central_area.png');
    images['citadel_east_area'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/citadel_east_area.png');
    images['citadel_south_area'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/citadel_south_area.png');
    images['citadel_north_area'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/citadel_north_area.png');
    images['citadel_west_area'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/citadel_west_area.png');

    // Open Fields
    images['open_fields_area1'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area1.png');
    images['open_fields_area2'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area2.png');
    images['open_fields_area3'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area3.png');
    images['open_fields_area4'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area4.png');
    images['open_fields_area5'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area5.png');
    images['open_fields_area6'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area6.png');
    images['open_fields_area7'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area7.png');
    images['open_fields_area8'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area8.png');
    images['open_fields_area9'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area9.png');
    images['open_fields_area10'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area10.png');
    images['open_fields_area11'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area11.png');
    images['open_fields_area12'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area12.png');
    images['open_fields_area13'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area13.png');
    images['open_fields_area14'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/open_fields_area14.png');
    
    // Ancient Forest
    images['ancient_forest_area1'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/ancient_forest_area_1.png');
    images['ancient_forest_area2'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/ancient_forest_area_2.png');
    images['ancient_forest_area3'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/ancient_forest_area_3.png');
    images['ancient_forest_village'] = loadImage('https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/maps/ancient_forest_village.png');



    // system elements
    images['arrow_up'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/sys/arrow_up.png';
    images['arrow_right'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/sys/arrow_right.png';
    images['arrow_down'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/sys/arrow_down.png';
    images['arrow_left'] = 'https://raw.githubusercontent.com/gustavo3578/roots-frontend/main/static/img/sys/arrow_left.png';


    respawn_menu = {
        'box_menu': createImg('https://opengameart.org/sites/default/files/styles/medium/public/Menu.png', 'respawn_menu'),
        'respawn_button': createButton('Rise'),
        'logout_button': createButton('Exit')
    };
    respawn_menu['box_menu'].hide();
    respawn_menu['respawn_button'].hide();
    respawn_menu['logout_button'].hide();
    
}


function load_respawn_menu(){
    respawn_menu = {
        'box_menu': createImg('https://opengameart.org/sites/default/files/styles/medium/public/Menu.png', 'respawn_menu'),
        'respawn_button': createButton('Rise'),
        'logout_button': createButton('Exit')
    }
    respawn_menu['box_menu'].position(
        (localStorage.getItem('map_size_x') / 2)-100,
        (localStorage.getItem('map_size_y') / 2)-100
    );
    respawn_menu['respawn_button'].position(
        (localStorage.getItem('map_size_x') / 2)-80,
        (localStorage.getItem('map_size_y') / 2)-6
    );
    respawn_menu['respawn_button'].mouseClicked(RespawnCallback);

    respawn_menu['logout_button'].position(
        (localStorage.getItem('map_size_x') / 2),
        (localStorage.getItem('map_size_y') / 2)-6
    );
    respawn_menu['logout_button'].mouseClicked(LogoutCallback);

    respawn_menu['box_menu'].show()
    respawn_menu['respawn_button'].show();
    respawn_menu['logout_button'].show();

    return respawn_menu;
}


function set_transfer_arrow_pointer(){
    let transfer_coords = area_transfer_points[localStorage.getItem('char_location')];
    for (i in transfer_coords){
        var pointer = createImg(images[transfer_coords[i][2]], 'transfer_point');
        pointer.position(transfer_coords[i][0], transfer_coords[i][1]);
        pointer.elt.value = transfer_coords[i][3];
        pointer.mouseClicked(AreaTransferCallback);
        pointer.show();
    }

}


function setup() {
    var login_status = localStorage.getItem('logged');
    if (login_status) {
        let size_x = localStorage.getItem('map_size_x');
        let size_y = localStorage.getItem('map_size_y');
        var canva = createCanvas(size_x, size_y);
        canva.parent('sketch-holder');
        upperBuffer = createGraphics(size_x, size_y);
        get_players(localStorage.getItem('char_location'));
        MountedLayoutSkill()
        MountedLayoutChat()
        spawned_enemy_query(localStorage.getItem('char_location')).then(data => {
            set_spawned_enemies(data);
        });
        set_transfer_arrow_pointer();

    }
    else {
        alert('Not logged!');
        window.location.href = "../index.html";
    }
}


function MountedLayoutSkill() {
    const skillsPlayer = JSON.parse(localStorage.getItem('skills'))
    if (skillsPlayer != undefined) {
        const canvas = $("#defaultCanvas0")
        $("#skills").css("height", `${canvas.outerHeight()}`).css("display", 'block')
        skillsPlayer.forEach(x => {
            var html = $(
                `<div><button type="button" onclick="use_skill('${x.name}', this)" class="btn btn-outline-dark btn-sm" data-toggle="tooltip" data-html="true" data-placement="bottom"
                title="<span class='badge badge-danger'>Power: ${x.power}</span> <span class='badge badge-info'>Range: ${x.range}</span> <span class='badge badge-warning'>Cost: ${x.spCost}</span>"
                ">${x.name}</button></div>`);

            $("#skills").children()[0].append(html[0])
        });
    }
}


function render_hud(){
    
    // HP BAR
    hp_hud = createElement('progress', 'HP');
    hp_hud.elt.value = localStorage.getItem('current_hp');
    hp_hud.elt.max = localStorage.getItem('max_hp');
    hp_hud.elt.id = 'HP_HUD';
    hp_hud.position(20, 26);
    hp_label = createElement('label', 'HP');
    hp_label.elt.for = 'HP_HUD';
    hp_label.position(2, 26);

    // SP BAR
    sp_hud = createElement('progress', 'SP');
    sp_hud.elt.value = localStorage.getItem('current_sp');
    sp_hud.elt.max = localStorage.getItem('max_sp');
    sp_hud.elt.id = 'SP_HUD';
    sp_hud.position(20, 62);
    sp_label = createElement('label', 'SP');
    sp_label.elt.for = 'SP_HUD';
    sp_label.position(2, 62);
}


function draw() {
    var login_status = localStorage.getItem('logged');
    if (login_status) {
        if (boolean(localStorage.getItem('is_ko')) == true){
            load_respawn_menu();
        }
        else{
            if (mouseIsPressed) {
                move_to_direction(mouseX, mouseY);
            }
            
            clear();
            draw_upper_buffer();
            image(upperBuffer, 0, 0);
            drawSprites();

            // draw hud
            render_hud();

            // draw player names
            for (let player in players) {
                players[player]['label'] = text(
                    players[player]['name'],
                    players[player]['x'],
                    players[player]['y'] - 10
                );
            };
        }
        
    }
}


function start_game() {
    let char_id = document.querySelector('input[name="select_char"]:checked').value;
    let area_location = document.getElementById(char_id).getAttribute('value');
    localStorage.setItem('char_location', area_location);
    var input_data = `{ id: \\\"${char_id}\\\"}`;
    var token = localStorage.getItem('token');
    character_login_mutation(input_data, `JWT ${token}`).then(data => {
        if (data['errors']) {
            alert('Failed to log in');
        }
        else {
            localStorage.setItem('is_ko', data['isKo']);
            localStorage.setItem("skills", JSON.stringify(data['skills']));
            map_area_data_query(area_location).then(data => {
                localStorage.setItem('map_size_x', data['mapArea']['sizeX']);
                localStorage.setItem('map_size_y', data['mapArea']['sizeY']);
                localStorage.setItem('char_id', char_id);
                window.location.href = 'game.html';
            });
        }
    });
}