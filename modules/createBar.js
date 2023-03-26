module.exports = {
    name: 'createBar',
    showname: 'Create Bar',
    addedconfig: {
        length: 10,
        pointer: false,
        filled: true,
        startchar: '▭',
        middlechar: '▭',
        endchar: '▭',
        pointerchar: '🔘',
        startcharfilled: '▬',
        middlecharfilled: '▬',
        endcharfilled: '▬',
        shownotcompleted: true,
    },
    createBar(obj) {
        // only if the value is completely empty, throw an error (if the value is 0, it will not throw an error)
        if(obj.value === undefined) throw new Error('The value is not specified');
        if(obj.max === undefined) throw new Error('The max is not specified');
        if(obj.value < 0) throw new Error('The value cannot be lower than 0');
        if(obj.max < 0) throw new Error('The max cannot be lower than 0');
        if(obj.length < 2) throw new Error('The length cannot be lower than 2');
        
        // if the value is higher than the max, set the value to the max
        if(obj.value > obj.max) obj.value = obj.max;
        if(!obj.length) obj.length = module.exports.client.config.modules['createBar'].addedconfig.length;
        if(!obj.pointer) obj.pointer = module.exports.client.config.modules['createBar'].addedconfig.pointer;
        if(!obj.filled) obj.filled = module.exports.client.config.modules['createBar'].addedconfig.filled;
        if(!obj.startchar) obj.startchar = module.exports.client.config.modules['createBar'].addedconfig.startchar;
        if(!obj.middlechar) obj.middlechar = module.exports.client.config.modules['createBar'].addedconfig.middlechar;
        if(!obj.endchar) obj.endchar = module.exports.client.config.modules['createBar'].addedconfig.endchar;
        if(!obj.pointerchar) obj.pointerchar = module.exports.client.config.modules['createBar'].addedconfig.pointerchar;
        if(!obj.startcharfilled) obj.startcharfilled = module.exports.client.config.modules['createBar'].addedconfig.startcharfilled;
        if(!obj.middlecharfilled) obj.middlecharfilled = module.exports.client.config.modules['createBar'].addedconfig.middlecharfilled;
        if(!obj.endcharfilled) obj.endcharfilled = module.exports.client.config.modules['createBar'].addedconfig.endcharfilled;
        if(!obj.shownotcompleted) obj.shownotcompleted = module.exports.client.config.modules['createBar'].addedconfig.shownotcompleted;
        
        // calculate the percent
        let percent = obj.value / obj.max;
        // calculate the completed length
        let repeatlength = Math.floor(obj.length * percent) - 2; if(repeatlength < 0) repeatlength = 0;
        // calculate the not completed length
        let repeatlengthnotcompleted = 0;
        if(obj.shownotcompleted) {
            repeatlengthnotcompleted = (obj.length - repeatlength) - 2; if(repeatlengthnotcompleted < 0) repeatlengthnotcompleted = 0;
        }

        // if the pointer is true, remove 1 from the completed length (because the pointer char is 1 char)
        if(obj.pointer) {
            repeatlength = repeatlength - 1; if(repeatlength < 0) repeatlength = 0;
        }

        // create the bar
        let bar = '';

        // if the bar is filled
        if(obj.filled) {
            // if the bar is not completed
            if(percent == 0) {
                // add the start char
                bar += obj.startchar;
                // add the middle chars
                bar += obj.middlechar.repeat(obj.length - 2);
                // add the end char
                bar += obj.endchar;
            } else if(percent == 1) {
                // add the start char
                bar += obj.startcharfilled;
                // add the middle chars
                bar += obj.middlecharfilled.repeat(obj.length - 2);
                // add the end char
                bar += obj.endcharfilled;
            } else {
                // add the start char
                bar += obj.startcharfilled;
                // add the middle chars
                bar += obj.middlecharfilled.repeat(repeatlength);
                // if the pointer is true
                if(obj.pointer) {
                    // add the pointer char
                    bar += obj.pointerchar;
                }
                // add the middle chars
                bar += obj.middlechar.repeat(repeatlengthnotcompleted);
                // add the end char
                bar += obj.endchar;
            }
        } else {
            // if the bar is not completed
            if(percent == 0) {
                // add the start char
                bar += obj.startchar;
                // add the middle chars
                bar += obj.middlechar.repeat(obj.length - 2);
                // add the end char
                bar += obj.endchar;
            } else if(percent == 1) {
                // add the start char
                bar += obj.startchar;
                // add the middle chars
                bar += obj.middlechar.repeat(obj.length - 2);
                // add the end char
                bar += obj.endchar;
            } else {
                // add the start char
                bar += obj.startchar;
                // add the middle chars
                bar += obj.middlechar.repeat(repeatlength);
                // if the pointer is true
                if(obj.pointer) {
                    // add the pointer char
                    bar += obj.pointerchar;
                }
                // add the middle chars
                bar += obj.middlechar.repeat(repeatlengthnotcompleted);
                // add the end char
                bar += obj.endchar;
            }
        }
        return bar;

        // Les options sont :
        // value, max

        // length

        // pointer (true/false) (si pointer est true, la barre aura un pointeur)
        // filled (true/false) (si filled est true, le pourcentage complété sera rempli)
        // shownotcompleted (true/false) (si shownotcompleted est true, la barre montrera la partie non complétée)

        // startchar (default: ▬)
        // middlechar (default: ▬)
        // endchar (default: ▬)

        // si pointer est true, la barre aura un pointeur
        // pointerchar (default: 🔘)

        // si filled est true, la barre sera remplie avec un caractère spécifique
        // startcharfilled (default: ▬)
        // middlecharfilled (default: ▬)
        // endcharfilled (default: ▬)
    }
}