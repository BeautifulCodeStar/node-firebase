const express = require('express');
const app = express();
const router = express.Router();
const admin = require('firebase-admin');
const moment = require('moment');
const keys = require('./credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(keys),
	databaseURL: 'https://rapid-being-177513.firebaseio.com'
})

const db = admin.database();
const cron = require('./cron');

const ref = db.ref('/');

const obj = require('./test');
const contact = obj.contact;
const cron_rules = obj.cron_rules;
const postRules = obj.postRules;
const postContacts = obj.postContacts;
const topNodes = obj.topNodes;

cron(db)
// ref.child('contacts').remove();
// ref.child('cron_rules').remove();
             
// ref.set(topNodes)


// makeJSON(contact).then(contacts => {
//     postContacts.contacts = contacts;
//     saveContacts(postContacts);
// })

makeJSON(cron_rules).then(rules => {
    postRules.rules = rules;
    saveCronRules(postRules);
})

// app.post('/contacts', function(req, res) 
function saveContacts(post) {
    const contacts = post.contacts;

    const accountId = post.accountId;
    const userId = post.userId;
    
    ref.once("value", function(snapshot) {
        if (contacts.length > 1000) {
            let dataArr = [];
            let segContacts = [];
            contacts.forEach((contact, key) => {
                segContacts.push(contact);
                if (segContacts.length >= 1000) {
                    dataArr.push(segContacts);
                    segContacts = [];
                }
                if (key === contacts.length - 1) {
                    dataArr.push(segContacts);
                    dataArr.forEach(subContacts => {
                        const data = snapshot.val();
                        const updates = {};
                        const path = '/contacts/accountId/' + accountId + '/userId/' + userId;
                        const newKey = ref.child(path).push().key;
                        const today = moment().format();
                
                        updates[path + '/' + newKey] = {
                            contacts: subContacts,
                            createdAt: today
                        }
                        return ref.update(updates);
                    });
                }
            });
           
        } else {
            const data = snapshot.val();
            const updates = {};
            const path = '/contacts/accountId/' + accountId + '/userId/' + userId;
            const newKey = ref.child(path).push().key;
            const today = moment().format();
    
            updates[path + '/' + newKey] = {
                contacts: contacts,
                createdAt: today
            }
            return ref.update(updates);
        }
       
    })
}
// })

// app.post('/rules', function(req, res) 
function saveCronRules(post) {
    const rules = post.rules;

    const accountId = post.accountId;
    const userId = post.userId;
    
    ref.once("value", function(snapshot) {

        const data = snapshot.val();
        const updates = {};
        const path = '/cron_rules/' + accountId;
        const newKey = ref.child(path).push().key;
        const today = moment().format();

        updates[path + '/' + newKey] = rules
        
        return ref.update(updates);
    })
}
// })



function makeJSON(obj) {
    const contacts = [];
    return new Promise((resolve, reject) => {
        for(i = 0; i < 2300; i++) {
            contacts.push(obj);
            if (i === 2200) {
                return resolve(contacts);
            }
        }
    })
}