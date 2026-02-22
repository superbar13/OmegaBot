// require discord.js module
const { ActivityType } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: 'status',
    showname: 'Status',
    addedconfig: {
        enabled: true,
        delay: 20000,
        type: ActivityType.Custom,
        statuslist: [
            'OmegaBot 5.0, the best bot !',
            'Sur ${client.guilds.cache.size} serveurs !',
            'Avec ${client.users.cache.size} utilisateurs !',
            'Maintenant sur Telegram !',
        ],
    },
    run: async (client) => {
        if (client.config.modules['status'].addedconfig.enabled == true) {
            // function sleep
            function sleep(ms) {
                return new Promise((resolve) => {
                    setTimeout(resolve, ms);
                });
            }

            let statuslist = client.config.modules['status'].addedconfig.statuslist;

            for (let i = 0; i < statuslist.length;) {
                // status watching
                client.user.setActivity(eval('`' + statuslist[i] + '`'), { type: client.config.modules['status'].addedconfig.type });
                // if final status, go back to first status
                if (i + 1 == statuslist.length) i = 0;
                else i++;
                await sleep(client.config.modules['status'].addedconfig.delay);
            }
        }
    }
}