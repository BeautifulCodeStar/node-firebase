const CronJob = require('cron').CronJob;
const moment = require('moment');

const cron = firebase => {
    new CronJob('*/3 * * * * *', function() {
        firebase.ref('/cron_rules/active').once('value', function(tasks) {
            console.log('Cron job is running...');
            const data = tasks.val();
            for (item in data) {
                console.log(item)
                const rules = data[item].rules;
                // console.log(rules.rules)
                const createdAt = data[item].createdAt;
                rules.forEach(rule => {
                    const days = moment().add(rules.days;
                    const today = moment().format();
                    const diff = today.diff(createdAt)
                    // const diff_day = diff->d;
                    console.log('diff: ', diff)
                    // if (diff_day == days) {
                        // call function with data
                        // call(rule);
                    // }

                })
             
            };
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;