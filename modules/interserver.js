module.exports = {
    name: 'interserver',
    showname: 'Interserver',
    run: async(client) => {
        client.interserversdb = require('../models/interservers.model.js');
        console.log('[DATABASE] Interserver database loaded !'.brightGreen);
        console.log('[DATABASE] Interserver not implemented yet !'.yellow);
    }
}
