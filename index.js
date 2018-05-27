const express = require('express');
const app = express();
const router = express.Router();
const admin = require('firebase-admin');
const moment = require('moment');
const async = require('async');
const keys = require('./credentials.json');

admin.initializeApp({
    credential: admin.credential.cert(keys),
    databaseURL: 'https://the-tokenizer-177515.firebaseio.com'
})

const db = admin.database();
const cron = require('./cron');

const obj = require('./test');
const contact = obj.contact;
const cron_rules = obj.cron_rules;
const postRules = obj.postRules;
const postContacts = obj.postContacts;

const topNodes = obj.topNodes;

cron(db)

makeJSON(contact).then(contacts => {
    postContacts.contacts = contacts;
    saveContacts(postContacts);
})

makeJSON(cron_rules).then(rules => {
    postRules.rules = rules;
    saveCronRules(postRules);
})

function saveContacts(post) {
    const ref = db.ref('/');
    const contacts = post.contacts;

    const accountId = post.accountId;
    const userId = post.userId;
    
    const path = '/lead_data';
    const uploadPath = 'lead_upload/' + accountId;
    const accountPath = '/account_leads/' + accountId + '/leads';
    let leadKeyArr = [];
    ref.once("value", function(snapshot) {
        const data = snapshot.val();
        if (contacts.length > 200) {
            let dataArr = [];
            let segContacts = [];
            contacts.forEach((contact, key) => {
                segContacts.push(contact);
                if (segContacts.length >= 200) {
                    dataArr.push(segContacts);
                    segContacts = [];
                }
                if (key === contacts.length - 1) {
                    dataArr.push(segContacts);
                    const updates = {};
                    dataArr.forEach((segContact, index) => {
                        segContact.forEach((subContact, ind) => {
                            if (subContact['number']) {
                                if (!data['conversations'][accountId][subContact['number']]) {
                                    return false;
                                }
                            }
                            const leadKey = ref.child(path).push().key;
                            leadKeyArr.push(leadKey);
                            const newKey = ref.child(accountPath).push().key;
                            // for lead_data
                            updates[path + '/' + leadKey] = {
                                data: subContact,
                                history: {
                                    date: moment().format(),
                                    event: "Lead Created",
                                    type: 'event'
                                },
                                source: 'import'
                            }
                          
                            // for account_leads
                            updates[accountPath + '/' + newKey] = leadKey;
                            if (index === subContact.length - 1) {
                                ref.update(updates);
                            }
                        })
                    });
                    // for lead_upload
                    const leadUploadKey = ref.child(uploadPath).push().key;
                    updates[uploadPath + '/' + leadUploadKey] = {
                        date: moment().format('l'),
                        numberOfContacts: contacts.length,
                        leads: leadKeyArr
                    };
                    ref.update(updates);
                    return {
                        status: 200,
                        numberOfContacts: contacts.length
                    };
                }
            });
        } else {
            const update = {};
            contacts.forEach((contact, key) => {
                if (contact['number']) {
                    if (!data['conversations'][accountId][contact['number']]) {
                        return false;
                    }
                }
                const leadKey = ref.child(path).push().key;
                leadKeyArr.push(leadKey);
                const newKey = ref.child(accountPath).push().key;
                updates[path + '/' + leadKey] = {
                    data: contact,
                    source: 'import'
                };
                updates[accountPath + '/' + newKey] = leadKey;
                if (key == contacts.length - 1) {
                    // for lead_upload
                    const leadUploadKey = ref.child(uploadPath).push().key;
                    updates[uploadPath + '/' + leadUploadKey] = {
                        date: moment().format('l'),
                        numberOfContacts: contacts.length,
                        leads: leadKeyArr
                    };
                    ref.update(updates);
                    return {
                        status: 200,
                        numberOfContacts: contacts.length
                    };
                }
            });
        }
    });
}

function saveCronRules(post) {
    const ref = db.ref('/cron_rules');

    const rules = post.rules;
    const accountId = post.accountId;
    const userId = post.userId;
    
    ref.once("value", function(snapshot) {
        const data = snapshot.val();
        const updates = {};
        const path = '/' + accountId;
        const newKey = ref.child(path).push().key;
        rules.forEach(rule => {
            updates[path + '/' + newKey] = rule;
        })
        return ref.update(updates);
    })
}

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