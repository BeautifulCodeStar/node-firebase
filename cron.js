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

const leadKeyCheck = function(leadKey, leadCronData) {
    return new Promise((resolve, reject) => {
        for (let key in leadCronData) {
            if (key.indexOf(leadKey) !== -1)  {
                reject(false);
            }
        }
        resolve(true);
    })
}

const creationDate = async function(db, accountId, data) {
    const leadKeyArr = await getLeadKey(accountId, data.account_leads);
    let mainArr = [];
  
    leadKeyArr.forEach(async (leadKey, index) => {
        const obj = await getCreatedAt(leadKey, data.lead_data);
     
        mainArr.push(obj);
        if (index === leadKeyArr.length - 1) {
            mainArr.forEach(async obj => {
                const createdAt = obj.createdAt;
                const leadKey = obj.leadKey;

                // leadKey check
                const leadKeyFlag = await leadKeyCheck(leadKey, data.lead_cron);
                if (leadKeyFlag) { // exist
                    return false;
                }

                for (let key in data.cron_rules[accountId]) {
                    const rule = data.cron_rules[accountId][key]
                    const scheduleDate = moment(createdAt).add(rule.days, 'days').format('l');
                    if (scheduleDate.indexOf(moment().format('l')) != -1) {
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

                        // Save lead_cron
                        const lead_cron = {};
                        const path = '/lead_cron/' + action.lead_key;
                        const newKey = ref.child(path).push().key;
                        lead_cron[path + '/' + newKey] = action.cron;
                        db.update(lead_cron);

                        // Call action with data
                    }
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