
let ressources = {
    mining: {
        coal: {
            min: 1,
            max: 25,
            name: 'Charbon',
            emoji: '🪨'
        },
        iron: {
            min: 0,
            max: 17,
            name: 'Fer',
            emoji: '🔩'
        },
        gold: {
            min: 0,
            max: 12,
            name: 'Or',
            emoji: '🥇'
        },
        diamond: {
            min: 0,
            max: 9,
            name: 'Diamant',
            emoji: '💎'
        },
        emerald: {
            min: 0,
            max: 7,
            name: 'Emeraude',
            emoji: '💚'
        },
        ruby: {
            min: 0,
            max: 5,
            name: 'Rubis',
            emoji: '🔴'
        },
        sapphire: {
            min: 0,
            max: 4,
            name: 'Saphir',
            emoji: '🔷'
        },
        amethyst: {
            min: 0,
            max: 2,
            name: 'Améthyste',
            emoji: '💜'
        },
        uranium: {
            min: 0,
            max: 1,
            name: 'Uranium',
            emoji: '☢️'
        },
    },
    woodcutting: {
        oak: {
            min: 5,
            max: 25,
            name: 'Chêne',
            emoji: '🌳'
        },
        spruce: {
            min: 2,
            max: 18,
            name: 'Sapin',
            emoji: '🌲'
        },
        birch: {
            min: 1,
            max: 14,
            name: 'Bouleau',
            emoji: '🌿'
        },
        jungle: {
            min: 0,
            max: 12,
            name: 'Palissandre',
            emoji: '🌴'
        },
        acacia: {
            min: 0,
            max: 4,
            name: 'Acacia',
            emoji: '🌵'
        },
        darkoak: {
            min: 1,
            max: 10,
            name: 'Chêne noir',
            emoji: '🍂'
        },
        fir: {
            min: 0,
            max: 8,
            name: 'Douglas',
            emoji: '🎋'
        },
        pine: {
            min: 0,
            max: 6,
            name: 'Pin',
            emoji: '🌾'
        }
    },
    farming: {
        wheat: {
            min: 8,
            max: 25,
            name: 'Blé',
            emoji: '🌾'
        },
        potato: {
            min: 5,
            max: 22,
            name: 'Pomme de terre',
            emoji: '🥔'
        },
        carrot: {
            min: 3,
            max: 20,
            name: 'Carotte',
            emoji: '🥕'
        },
        strawberry: {
            min: 0,
            max: 14,
            name: 'Fraise',
            emoji: '🍓'
        },
        tomato: {
            min: 0,
            max: 18,
            name: 'Tomate',
            emoji: '🍅'
        },
        radish: {
            min: 0,
            max: 16,
            name: 'Radis',
            emoji: '🍀'
        },
        apple: {
            min: 0,
            max: 24,
            name: 'Pomme',
            emoji: '🍎'
        },
        orange: {
            min: 0,
            max: 22,
            name: 'Orange',
            emoji: '🍊'
        },
        pear: {
            min: 0,
            max: 19,
            name: 'Poire',
            emoji: '🍐'
        },
        banana: {
            min: 0,
            max: 17,
            name: 'Banane',
            emoji: '🍌'
        },
    },
    fishing: {
        salmon: {
            min: 0,
            max: 24,
            name: 'Saumon',
            emoji: '🐟'
        },
        sea_bream: {
            min: 0,
            max: 20,
            name: 'Daurade',
            emoji: '🐠'
        },
    },
    hunting: {
        rabbit: {
            min: 10,
            max: 12,
            name: 'Lapin',
            emoji: '🐇'
        },
        chicken: {
            min: 17,
            max: 20,
            name: 'Poulet',
            emoji: '🐔'
        },
        beef: {
            min: 0,
            max: 12,
            name: 'Boeuf',
            emoji: '🐄'
        },
        pig: {
            min: 15,
            max: 18,
            name: 'Cochon',
            emoji: '🐖'
        },
        sheep: {
            min: 12,
            max: 15,
            name: 'Mouton',
            emoji: '🐑'
        },
    }
}

// ressourcesSchema is ressources but with only type and default in category
let ressourcesSchema = {};
for (let category in ressources) {
    ressourcesSchema[category] = {};
    for (let ressource in ressources[category]) {
        ressourcesSchema[category][ressource] = {
            type: Number,
            default: 0
        }
    }
}

module.exports = {
    name: 'rpg',
    showname: 'RPG',
    userSchemaAddition: {
        rpg: {
            position: {
                x: {
                    type: Number,
                },
                z: {
                    type: Number,
                }
            },
            money: {
                type: Number,
                default: 0
            },
            ultramoney: {
                type: Number, // ultramoney is a type of money that can be used to buy things in the ultrashop
                default: 0
            },
            xp: {
                type: Number, // xp define the tier of the player (100 xp = tier 1, 200 xp = tier 2, etc...)
                default: 0
            },
            business: {
                job: {
                    type: String,
                    ref: 'Job'
                },
                xp: {
                    type: Number,
                    default: 0
                },
            },
            health: {
                type: Number,
                default: 100
            },
            food: {
                type: Number,
                default: 100
            },
            water: {
                type: Number,
                default: 100
            },
            inventory: {
                type: Array,
                default: []
            },
            slots: {
                type: Number,
                default: 10
            },
            ressources: ressourcesSchema,
            equipment: {
                helmet: {
                    type: String,
                    ref: 'Item'
                },
                chestplate: {
                    type: String,
                    ref: 'Item'
                },
                leggings: {
                    type: String,
                    ref: 'Item'
                },
                boots: {
                    type: String,
                    ref: 'Item'
                },
                hand: {
                    type: String, // right hand, can be a sword
                    ref: 'Item'
                },
                otherhand: {
                    type: String, // left hand, can be a shield
                    ref: 'Item'
                }
            },
        }
    },
    addedconfig: {
        loadDistance: 10,
        RenderDistance: 10,
        chunkSize: 50,
        SnowLevel: 370,
        RenderType: 'canvas',
        seed: 12345,
        PixelType: [
            {
                id: 0,
                name: 'Air',
                level: 0,
                rgb: [0, 0, 0],
                emoji: '🌫️',
                time: 0
            },
            {
                id: 2,
                name: 'Water',
                level: 0.20,
                rgb: [3, 169, 244],
                emoji: '💧',
                time: 200,
                disabledRessources: ['mining', 'woodcutting', 'farming', 'hunting'],
                modifiedRessources: {
                    fishing: {
                        salmon: {
                            min: 10,
                            max: 30
                        },
                        sea_bream: {
                            min: 7,
                            max: 25
                        },
                    }
                },
                foodMultiplier: 0.75,
                waterMultiplier: 0.75
            },
            {
                id: 3,
                name: 'Sand',
                level: 0.21,
                rgb: [255, 193, 7],
                emoji: '🏖️',
                time: 350,
                disabledRessources: ['mining', 'woodcutting', 'farming', 'hunting'],
                foodMultiplier: 0.55,
                waterMultiplier: 0.55
            },
            {
                id: 1,
                name: 'Grass',
                level: 0.30,
                rgb: [64, 154, 67],
                emoji: '🌱',
                time: 100,
                disabledRessources: ['fishing'],
            },
            {
                id: 6,
                name: 'Forest',
                level: 0.35,
                rgb: [27, 94, 32],
                emoji: '🌲',
                time: 300,
                disabledRessources: ['fishing'],
                modifiedRessources: {
                    woodcutting: {
                        oak: {
                            min: 10,
                            max: 30
                        },
                        spruce: {
                            min: 7,
                            max: 25
                        },
                        birch: {
                            min: 5,
                            max: 20
                        },
                        jungle: {
                            min: 3,
                            max: 15
                        },
                        acacia: {
                            min: 2,
                            max: 10
                        },
                        darkoak: {
                            min: 1,
                            max: 15
                        },
                        fir: {
                            min: 0,
                            max: 12
                        },
                        pine: {
                            min: 0,
                            max: 9
                        }
                    },
                    hunting: {
                        rabbit: {
                            min: 10,
                            max: 25
                        },
                        chicken: {
                            min: 7,
                            max: 20
                        },
                        beef: {
                            min: 5,
                            max: 15
                        },
                        pig: {
                            min: 3,
                            max: 10
                        },
                        sheep: {
                            min: 2,
                            max: 7
                        },
                    }
                },
                foodMultiplier: 0.85,
                waterMultiplier: 0.85
            },
            {
                id: 4,
                name: 'Rock',
                level: 0.38,
                rgb: [74, 48, 39],
                emoji: '🏔️',
                time: 400,
                disabledRessources: ['woodcutting', 'farming', 'fishing'],
                modifiedRessources: {
                    mining: {
                        coal: {
                            min: 10,
                            max: 30
                        },
                        iron: {
                            min: 7,
                            max: 25
                        },
                        gold: {
                            min: 5,
                            max: 20
                        },
                        diamond: {
                            min: 3,
                            max: 15
                        },
                        emerald: {
                            min: 2,
                            max: 10
                        },
                        ruby: {
                            min: 1,
                            max: 15
                        },
                        sapphire: {
                            min: 0,
                            max: 12
                        },
                        amethyst: {
                            min: 0,
                            max: 9
                        },
                        uranium: {
                            min: 0,
                            max: 6
                        },
                    }
                },
                foodMultiplier: 0.65,
                waterMultiplier: 0.65
            },
            {
                id: 5,
                name: 'Snow',
                level: 1,
                rgb: [249, 249, 249],
                emoji: '❄️',
                time: 500,
                disabledRessources: ['fishing'],
                foodMultiplier: 0.5,
                waterMultiplier: 0.5
            }
        ]
    },
    run: async (client) => {
        const { Application, Camera, NoiseGenerator } = require('./map.js');

        let RENDER_DISTANCE = client.config.modules['rpg'].addedconfig.RenderDistance;
        let LOAD_DISTANCE = client.config.modules['rpg'].addedconfig.loadDistance;
        let CHUNK_SIZE = client.config.modules['rpg'].addedconfig.chunkSize;
        let SNOW_LEVEL = client.config.modules['rpg'].addedconfig.SnowLevel;
        let RENDER_TYPE = client.config.modules['rpg'].addedconfig.RenderType;
        let SEED = client.config.modules['rpg'].addedconfig.seed;
        let PixelType = client.config.modules['rpg'].addedconfig.PixelType;

        const noiseGenerator = new NoiseGenerator(
            SEED,
            CHUNK_SIZE
        );

        var camera = new Camera(
            {
                x: 50000,
                z: 50000
            },
            RENDER_DISTANCE
        );

        var app = new Application(
            client,
            RENDER_TYPE,
            camera,
            noiseGenerator,
            LOAD_DISTANCE,
            CHUNK_SIZE,
            SNOW_LEVEL,
            PixelType
        );

        async function start() {
            // add ressources to app
            app.resources = ressources;

            // load model
            client.mapdb = require('../models/map.model');

            // load mappoints model
            client.mappointsdb = require('../models/mappoints.model');

            // load jobsdb model
            client.jobsdb = require('../models/jobs.model');

            // load clansdb model
            client.clansdb = require('../models/clans.model');

            // load data from database
            let data = await client.mapdb.GetMap();

            // if the map exists, load it
            if (data) app.load(data);

            // generate the map
            app.run();

            // if the map doesn't exists, save it
            if (!data) {
                // get data
                data = app.save();
                // save data to database
                client.mapdb.SaveMap(data);
            }

            client.RPG = app;
        }
        start();
    }
}