const express = require('express');
const app = express();
const router = express.Router();
const admin = require('firebase-admin');
const keys = require('./credentials.json');
admin.initializeApp({
    credential: admin.credential.cert(keys),
	databaseURL: 'https://rapid-being-177513.firebaseio.com'
})

const db = admin.database();
const ref = db.ref('/');

const contact = {
    city: "New York",
    email: "alex@gmail.com",
    firstName: "Alexander",
    lastName: "Alexander",
    number: "88888888",
    state: "NY",
    zip_code: "11207"
}

const cron_rules = {
    body:  "Hi, Are you free for a call?",
    days: 15,
    subject: "Hi there!",
    type: "email"
}

const cron = require('./cron');

cron(db)

makeJSON(contact).then(contacts => {
    setInterval(() => {
        update(contacts)
    }, 1000);
})

ref.once("value", function(snapshot) {
    console.log(snapshot.val());
},
function (errorObject) {
    console.log("THe read failed:" + errorObject.code);
})


function makeJSON(obj) {
    const contacts = [];
    return new Promise((resolve, reject) => {
        for(i = 0; i < 1000; i++) {
            contacts.push(obj);
            if (i === 999) {
                return resolve(contacts);
            }
        }
    })
}

function wirteContact(obj=null) {
    if (obj) {
        db.ref('data').set(obj);
    }
}

function update(obj) {
    const newKey = ref.child('data').push().key;
    const updates = {};

    updates['/data/' + newKey] = obj;

    return ref.update(updates);
}




