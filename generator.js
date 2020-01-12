const admin = require('firebase-admin');
admin.initializeApp();

const axios = require('axios');
const API_URL = 'http://34.69.9.37:9000/register?uid=';
//const API_URL = 'http://localhost:9000/register?uid=';

const fakerator = require('fakerator')();
var Sentencer = require('sentencer');

async function main() {
    for (let i = 0; i < 100; i++) {
        const fname = fakerator.names.firstName();
        const lname = fakerator.names.lastName();
        const name = fname + ' ' + lname;
        const email = fakerator.internet.email(fname, lname);
        let sent = Sentencer.make('I am ' + name + ' and I love to work on {{ adjective }} {{ nouns }} and am interested in {{ adjective }} {{ nouns }}.');
        let info = new Array(34);
        for (let a = 0; a < 34; a++) {
            if (a >= 4) info[a] = Math.random() * 0.6 + 0.2;
            else info[a] = 0;
        }
        admin.auth().createUser({
            displayName: name,
            email: email,
            password: fakerator.internet.password()
        }).then(res => {
            axios.post(API_URL + res.uid, {
                about: {name: name, description: sent},
                info: info
            });
        });
        await sleep(250);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}  

main();
