const CronJob = require('cron').CronJob;
const moment = require('moment');

const getLeadKey = function(id, accountLeads) {
    return new Promise((resolve, reject) => {
        for (accountId in accountLeads) {
            if (id === accountId) {
                const leads = accountLeads[accountId].leads;
                let leadKeyArr = [];
                for (let key in leads) {
                    leadKeyArr.push(leads[key]);
                }
                resolve(leadKeyArr);
            }
        }
    })
}

const getCreatedAt = function(leadKey, leadData) {
    return new Promise((resolve, reject) => {
        for (let key in leadData) {
            if (key.indexOf(leadKey) !== -1) {
                const contactData = leadData[key]['data'];
                const history = leadData[key]['history'];
                for (let item in history) {
                    if (history[item]['event'].indexOf('Lead Created') !== -1) {
                        const createdAt = history[item]['date'];
                        resolve({createdAt, contactData, leadKey});
                    }
                }
            }
        }
    })
}

const saveLeadCron = function(action) {
    return new Promise((resolve, reject) => {
        const updates = {};
        const path = '/lead_cron/' + action.lead_key;

        updates[path] = action.cron;
        resolve(updates);
    })
}


const creationDate = async function(db, accountId, data) {
    const leadKeyArr = await getLeadKey(accountId, data.account_leads);
    let mainArr = [];
  
    leadKeyArr.forEach(async (leadKey, index) => {
        const obj = await getCreatedAt(leadKey, data.lead_data);

        mainArr.push(obj);
        if (index === leadKeyArr.length - 1) {
            mainArr.forEach(obj => {
                const createdAt = obj.createdAt;
                const leadKey = obj.leadKey;

                for (let key in data.cron_rules[accountId]) {
                    data.cron_rules[accountId][key].forEach(rule => {
                        const schedule = moment(createdAt).add(rule.days, 'days').format('l');
                        if (schedule.indexOf(moment().format('l')) != -1) {
                            console.log('Call function with data****');
                            let action = {};
                            if (rule.type == 'email') {
                                action = {
                                    cron: rule,
                                    lead_key: leadKey,
                                    email: obj.email
                                }
                            } else {
                                action = {
                                    cron: rule,
                                    lead_key: leadKey,
                                    number: obj.number
                                }
                            }
                            const lead_cron = {};
                            const path = '/lead_cron/' + action.lead_key;
                            const newKey = ref.child(path).push().key;
                            lead_cron[path + '/' + newKey] = action.cron;
                            console.log('____________________LeadCron____________');
                            console.log(lead_cron);
                            console.log('_________________________________________');
                            db.update(lead_cron);
                            console.log(action);
                            // call(action);
                        }
                    })
                }
            })
        }
    })
}

const cron = firebase => {
    new CronJob('1 1 1 * * 0-6', function() {
        const db = firebase.ref('/');
        db.once('value', function(tasks) {
            const data = tasks.val();
            
            const cronRules = data.cron_rules;

            for (accountId in cronRules) {
                console.log('AccountId: ', accountId)
                creationDate(db, accountId, data);
            };
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;