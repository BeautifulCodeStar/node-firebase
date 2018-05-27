const CronJob = require('cron').CronJob;
const moment = require('moment');

const getLeadKey = function(id, firebase) {
    return new Promise((resolve, reject) => {
        const ref = firebase.ref('/account_leads/' + id);
        ref.once('value', function(data) {
            const accountLeads = data.val();
            if (accountLeads) {
                const leads = accountLeads.leads;
                let leadKeyArr = [];
                for (let key in leads) {
                    leadKeyArr.push(leads[key]);
                }
                resolve(leadKeyArr);
            } else {
                reject(false);
            }
        })
    })
}

const getCreatedAt = function(leadKey, firebase) {
    return new Promise((resolve, reject) => {
        const ref = firebase.ref('/lead_data/' + leadKey);
        ref.once('value', function (data) {
            const leadData = data.val();
            if (leadData) {
                const contactData = leadData['data'];
                const history = leadData['history'];
                for (let item in history) {
                    if (history[item]['event'].indexOf('Lead Created') !== -1) {
                        const createdAt = history[item]['date'];
                        resolve({createdAt, contactData, leadKey});
                    }
                }
            } else {
                reject(false);
            }
        })
    })
}

const leadKeyCheck = function(leadKey, cronKey, firebase) {
    return new Promise((resolve, reject) => {
        const ref = firebase.ref('/lead_cron/' + leadKey + '/' + cronKey);
        ref.once('value', function (data) {
            const leadCronData = data.val();
            if (leadCronDatap) {
                reject(false);
            } else {
                resolve(true);
            }
        })
    })
}

const creationDate = async function (db, accountId, cronRules,firebase) {
    const leadKeyArr = await getLeadKey(accountId, firebase);
    if (!leadKeyArr) {
        return 'did not get leadkey';
    }
    let mainArr = [];
  
    leadKeyArr.forEach(async (leadKey, index) => {
        const obj = await getCreatedAt(leadKey, firebase);
        if (!obj) {
            return 'did not get date created!';
        }
        mainArr.push(obj);
        if (index === leadKeyArr.length - 1) {
            mainArr.forEach(async obj => {
                const createdAt = obj.createdAt;
                const leadKey = obj.leadKey;

                
                for (let key in cronRules[accountId]) {
                    // leadKey check
                    const leadKeyFlag = await leadKeyCheck(leadKey, key, firebase);
                    if (leadKeyFlag) { // exist
                        return false;
                    }
                    const rule = cronRules[accountId][key]
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
                        lead_cron[path + '/' + key] = action.cron;
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
        const db = firebase.ref('/cron_rules');
        db.once('value', function(data) {
            const cronRules = data.val();
            
            for (accountId in cronRules) {
                creationDate(db, accountId, cronRules, firebase);
            };
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;