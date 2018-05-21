const CronJob = require('cron').CronJob;
const moment = require('moment');

const cron = firebase => {
    new CronJob('1 1 1 * * 0-6', function() {
        firebase.ref('/cron_rules/active').once('value', function(tasks) {
            const data = tasks.val();
            for (item in data) {
                const rules = data[item].rules;
                const createdAt = data[item].createdAt;
                rules.forEach(rule => {
                    const schedule = moment(createdAt).add(rule.days, 'days').format('l');
                    if (schedule.indexOf(moment().format('l')) != -1) {
                        // call function with data
                        // call(rule);
                    }
                })
             
            };
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;