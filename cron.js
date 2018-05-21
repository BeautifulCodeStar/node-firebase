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
        for (key in leadData) {
            if (key === leadKey) {
                const contactData = leadData[key]['data'];
                const history = leadData[key]['history'];
                for (let item in history) {
                    if (history[item]['event'] === 'Lead Crated') {
                        const createdAt = history[item]['date'];
                        resolve({createdAt, contactData, leadKey});
                    }
                }
            }
        }
    })
}

const creationDate = async function(accountId, data) {
    const leadKeyArr = await getLeadKey(accountId, data.account_leads);
    console.log('leadKey:', leadKeyArr)
    let mainArr = [];
    leadKeyArr.forEach(async (leadKey, index) => {
        const obj = await getCreatedAt(leadKey, data.lead_data);
        console.log('____________________',obj)
        mainArr.push(obj);
        if (index === leadKeyArr.length - 1) {
            mainArr.forEach(async obj => {
                const createdAt = obj.createdAt;
                const leadKey = obj.leadKey;
                console.log('CreatedAt: ', createdAt);
                for (key in cronRules[accountId]) {
                    cronRules[accountId][key].forEach(async rule => {
                        const schedule = moment(createdAt).add(rule.days, 'days').format('l');
                        if (schedule.indexOf(moment().format('l')) != -1) {
                            // call function with data
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
                            console.log('________');
                            console.log(action);
                            // call(action);
                        }
                    })
                }
            })
        }
    })
    console.log('Date:', mainArr);
    
}

const cron = firebase => {
    new CronJob('*/10 * * * * *', function() {
        firebase.ref('/').once('value', function(tasks) {
            const data = tasks.val();
            
            const accounts = data.accounts;
            const accountLeads = data.account_leads;
            const leadData = data.lead_data;
            const cronRules = data.cron_rules;

            for (accountId in cronRules) {
                console.log('AccountId: ', accountId)
                creationDate(accountId, data);
            };
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;