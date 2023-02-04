// const server_host = 'http://localhost:11000/graphql/';
const server_host = "https://ggj23server.brunolcarli.repl.co/graphql/";


function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
};


function json(response) {
    return response.json()
};


function get_request_options(payload) {
    return {
        method: 'POST',
        headers: {
            cookie: 'csrftoken=pgrjljBkHdbd9hySxmJaFUlewPM1IdYJ09nZstz9N6bCf8pfuctT4ftl2girhj6t',
            'Content-Type': 'application/json'
        },
        body: payload
    };
};


// function query_entities() {
//     /*
//     Request the entities (elements, objects, players, etc) currently
//     active on the game. Receives a json containing logged users and
//     their position on the map.
//         - Params: None
//         - Return: Object
//     */
//     var token = localStorage.getItem('token');
//     var headers = {
//         "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
//         "Content-Type": "application/json",
//         "Authorization": `JWT ${token}`
//     };
//     return fetch(server_host, {
//         "method": "POST",
//         "headers": headers,
//         "body": "{\"query\":\"query{\\n  entities(logged:true){\\n    name\\n    logged\\n    location{\\n      x\\n      y\\n    }\\n  }\\n}\\n\"}"
//     })
//         .then(json)
//         .then(data => {
//             return data['data']['entities'];
//         })
//         .catch(err => {
//             console.error(err);
//         });
// };


function login_mutation(email, password) {
    /*
    Request a sign in to the game server. Receives a token to be used
    as session validation on backend requests.
        - Params:
            + email: string;
            + password: string
        - Return: null / undefined
    */
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
        },
        "body": `
        {\"query\":\"mutation{\\n  logIn(input: {email: \\\"${email}\\\" password: \\\"${password}\\\"}){\\n    token\\n  }\\n}\\n\"}`
    })
        .then(json)
        .then(data => {
            if (data['errors']){
                alert(data['errors'][0]['message']);
                return
            }
            localStorage.setItem('logged', true);
            localStorage.setItem('token', data['data']['logIn']['token']);
            localStorage.setItem('email', email);
            window.location.href = "pages/character.html";
        })
        .catch(err => {
            console.error(err);
        });
};


function logout_mutation(username) {
    /*
    Request to logout server.
        - Params:
            + username: string;
        - Return: null / undefined
    */
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
            "Authorization": `JWT ${token}`
        },
        "body": `
        {\"query\":\"mutation{\\n  logOut(input: {username: \\\"${username}\\\"}){\\n    response\\n  }\\n}\\n\"}`
    })
        .then(json)
        .then(data => {
            if (data['data']['logOut']['response']) {
                window.location.href = "../index.html";
            }
        })
        .catch(err => {
            console.error(err);
        });
};


function update_position(player, x, y) {
    /*
    Updates player position on the map.
        - Params:
            + player: string;
            + x: int;            + y: int;
        - Return: null | undefined
    */
    var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{\"query\":\"mutation { updatePosition(input: { reference: \\\"${player}\\\" location: { x: ${x} y: ${y} } }){ entity { name location { x y } } } }\"}`
    })
        .then(json)
        .then(data => {
            console.log("data", data)
        })
        .catch(err => {
            console.error(err);
        });
};


function send_chat_message(message, chat_zone) {
    /*
    Sends a chat message.
    The chat_zone param on the backend is an enum, so the payload
    of this parameter must be ALL CAPS and without quotation marks
    around ir on the mutation input.
        - Params:
            + player_name: string;
            + message: string;
            + chat_zone: string (ALL CAPS);
        - Return: null | undefined
    */
    var token = localStorage.getItem('token');
    var headers = {
        "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
        "Content-Type": "application/json",
        "Authorization": `JWT ${token}`
    };
    return fetch(server_host, {
        "method": "POST",
        "headers": headers,
        "body": `{"query": "mutation SendChatMessage{ sendChatMessage(text: \\\"${message}\\\", chatroom: \\\"${chat_zone}\\\"){ ok }}"}`
    })
        .then(json)
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.error(err);
        });
};


function user_characters() {
    var token = localStorage.getItem('token');
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=ctJzx1RBM4kTPkPWGpZsBIf3EUY8gr0Td2C4OCeWCsslpyXLYCLpjQGYRlxSfFZP",
            "Content-Type": "application/json",
            "Authorization": `JWT ${token}`
        },
        "body": "{\"query\":\"\\nquery user_chars {\\n\\tuserCharacters{\\n\\t\\tname\\n\\t\\tlogged\\n\\t\\tgoblinClass\\n\\t\\tlv\\n\\t\\tsprite\\n\\t\\tmapArea{\\n\\t\\t\\treference\\n\\t\\t\\tonlineCount\\n\\t\\t}\\n\\t\\tlocation{\\n\\t\\t\\tx\\n\\t\\t\\ty\\n\\t\\t}\\n\\t}\\n}\",\"operationName\":\"user_chars\"}"
    })
        .then(json)
        .then(data => {
            data = data['data']['userCharacters'];
            fill_characters_panel(data)
        })
        .catch(err => {
            console.error(err);
        });
};


function character_login_mutation(input_data, authorization) {
    const query = `characterLogin(input: ${input_data})`;
    const payload = `{"query": "mutation charLogin{${query}{logStatus{charName logged}}}"}`;
    var options = get_request_options(payload);
    options['headers']['Authorization'] = authorization;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            console.log(response);
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};


function character_logout_mutation(input_data, authorization) {
    const query = `characterLogout(input: ${input_data})`;
    const payload = `{"query": "mutation charLogout{${query}{logStatus{charName logged}}}"}`;
    var options = get_request_options(payload);
    options['headers']['Authorization'] = authorization;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            console.log(response);
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};

function new_user_sign_up(username, password, email) {
    var payload = `{"query":"mutation{signUp(input: {username: \\\"${username}\\\" password: \\\"${password}\\\" email: \\\"${email}\\\"}){user {username}}}"}`;
    console.log(payload);
    return fetch(server_host, {
        "method": "POST",
        "headers": {
            "cookie": "csrftoken=9YXcKsPnJSojmIXsjvqlM7TFP0tBfiU8GwVopYDWNKHSQnEUKLnPzJdsCjSb0Cfn",
            "Content-Type": "application/json",
        },
        "body": payload
    })
        .then(json)
        .then(data => {
            console.log(data);
            alert("Username registered!!!");
            return data;
            // window.location.href = "pages/character.html";
        })
        .catch(err => {
            console.error(err);
        });
};



function query_logged_characters() {
    const payload = `{"query": "query characters{ characters(logged: true){ name logged location{ x y } } }"}`;
    var options = get_request_options(payload);
    options['headers']['Authorization'] = 'JWT ' + localStorage.getItem('token');
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            console.log(response);
            return response['data']['characters'];
        })
        .catch(err => {
            console.error(err);
        });
};


function create_char_mutation(input_data, token) {
    const payload = `{"query": "mutation create_character{createCharacter(input:${input_data}){character{name}}}"}`;
    console.log(payload);
    var options = get_request_options(payload);
    options['headers']['Authorization'] = 'JWT ' + token;
    return fetch(server_host, options)
        .then(json)
        .then(response => {
            console.log(response);
            return response['data'];
        })
        .catch(err => {
            console.error(err);
        });
};
