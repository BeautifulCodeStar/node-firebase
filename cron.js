const CronJob = require('cron').CronJob;

const cron = firebase => {
    new CronJob('* * * * * *', function() {
        firebase.ref('/').once('value', function(tasks) {
            console.log(tasks.val())
        })
    }, null, true, 'America/Los_Angeles')
}

module.exports = cron;