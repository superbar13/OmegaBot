const fs = require('fs');
const { createCanvas, loadImage } = require('@napi-rs/canvas')
var PF = require('pathfinding');
let ressources = {
    mining: {
        coal: {
            min: 1,
            max: 25
        },
        iron: {
            min: 0,
            max: 17
        },
        gold: {
            min: 0,
            max: 12
        },
        diamond: {
            min: 0,
            max: 9
        },
        emerald: {
            min: 0,
            max: 7
        },
        ruby: {
            min: 0,
            max: 5
        },
        sapphire: {
            min: 0,
            max: 4
        },
        amethyst: {
            min: 0,
            max: 2
        },
        uranium: {
            min: 0,
            max: 1
        },
    },
    woodcutting: {
        oak: {
            min: 5,
            max: 25
        },
        spruce: {
            min: 2,
            max: 18
        },
        birch: {
            min: 1,
            max: 14
        },
        jungle: {
            min: 0,
            max: 12
        },
        acacia: {
            min: 0,
            max: 4
        },
        darkoak: {
            min: 1,
            max: 10
        },
        fir: {
            min: 0,
            max: 8
        },
        pine: {
            min: 0,
            max: 6
        }
    },
    farming: {
        wheat: {
            min: 8,
            max: 25
        },
        potato: {
            min: 5,
            max: 22
        },
        carrot: {
            min: 3,
            max: 20
        },
        strawberry: {
            min: 0,
            max: 14
        },
        tomato: {
            min: 0,
            max: 18
        },
        radish: {
            min: 0,
            max: 16
        },
        apple: {
            min: 0,
            max: 24
        },
        orange: {
            min: 0,
            max: 22
        },
        pear: {
            min: 0,
            max: 19
        },
        banana: {
            min: 0,
            max: 17
        },
    },
    fishing: {
        salmon: {
            min: 0,
            max: 24
        },
        sea_bream: {
            min: 0,
            max: 20
        },
    },
    hunting: {
        rabbit: {
            min: 10,
            max: 12
        },
        chicken: {
            min: 17,
            max: 20
        },
        beef: {
            min: 0,
            max: 12
        },
        pig: {
            min: 15,
            max: 18
        },
        sheep: {
            min: 12,
            max: 15
        },
    }
}

// ressourcesSchema is ressources but with only type and default in category
let ressourcesSchema = {};
for(let category in ressources){
    ressourcesSchema[category] = {};
    for(let ressource in ressources[category]){
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
    run: async(client) => {
        class Application {
            constructor(renderType, camera, noiseGenerator, loadDistance, chunksize, snowLevel, PixelType){
                this.camera = camera;
                this.run = this.run.bind(this);
                this.loadDistance = loadDistance;
                this.chunkManager = new ChunkManager(noiseGenerator, chunksize, snowLevel, PixelType);
                const canvas = createCanvas(1000, 1000);
                const context = canvas.getContext('2d');
                this.renderer = new Renderer(renderType, chunksize, canvas, context);
                this.pixeltype = PixelType;

                this.players = async function(){
                    // load users
                    let users = await client.usersdb.find();
                    // load players
                    let players = users.map((element) => {
                        return {
                            x: element?.rpg?.position?.x,
                            z: element?.rpg?.position?.z,
                            name: client.users.cache.get(element.id)?.username,
                        }
                    });
                    // remove players with no position
                    players = players.filter((element) => element?.x && element?.z);
                    // return players
                    return players;
                }

                this.points = async function(){
                    // load points
                    let points = await client.mappointsdb.find();
                    // return points
                    return points;
                }
            }
        
            save(){
                var chunks = this.chunkManager.get();
                var seed = this.chunkManager.terrainGenerator.noiseGenerator.getSeed();
                var data = {
                    chunks: chunks,
                    seed: seed
                }
                return data;
            }

            getPixelType(id){
                return this.pixeltype.find((element) => element.id == id);
            }
        
            load(data){
                this.chunkManager.load(data.chunks);
                if(data.seed) this.chunkManager.terrainGenerator.noiseGenerator.setSeed(data.seed);
            }
        
            run() {
                this.chunkManager.loadChunks(this.loadDistance, this.camera); // Load chunks (that means generate and buffer)
            }

            async runRender(){
                let result = this.renderer.draw(this.camera, this.chunkManager, await this.points(), await this.players()); // Draw chunks (that means render on canvas or text)
                return result;
            }

            getRandomCoords(){
                let pixelAndChunk;
                let x;
                let z;
                while(!pixelAndChunk || !pixelAndChunk?.pixel || pixelAndChunk?.pixel?.type != 1){
                    let minmax = this.chunkManager.getMinMaxCoords();
                    x = Math.floor(Math.random() * (minmax.maxx - minmax.minx + 1) + minmax.minx);
                    z = Math.floor(Math.random() * (minmax.maxz - minmax.minz + 1) + minmax.minz);
                    pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(x, z);
                }
                return {
                    x: x,
                    z: z
                }
            }

            async getPlayerPosition(id){
                // get the user
                let user = await client.usersdb.findOne({ id: id });
                // if the user doesn't exist, return false
                if(!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;
                // get the pixel and chunk
                let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(user.rpg.position.x, user.rpg.position.z);
                // if the pixel and chunk doesn't exist, return false
                if(!pixelAndChunk) return false;
                // return the pixel and chunk
                return pixelAndChunk;
            }

            async spawn(id){
                // get the user
                let position = await this.getPlayerPosition(id);
                if(position) return false;

                let coords = this.getRandomCoords();
                try{
                    await client.usersdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': id
                        }, {
                            'rpg.position.x': coords.x,
                            'rpg.position.z': coords.z
                        })
                    ])
                }catch(err){console.log(err);}
                return coords;
            }

            async travel(id, x, z, updatefunction, finishcallback){
                if(!updatefunction) updatefunction = async () => {};

                // get the user
                let user = await client.usersdb.findOne({ id: id });
                // if the user doesn't exist, return false
                if(!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;

                // we use the basic gps to get the path
                console.log('[TRAVEL] Récupération du chemin');
                let path = await this.gps(user, x, z);
                // if we don't have a path, return false
                if(!path) return false;
                console.log('[TRAVEL] Le chemin a été récupéré');

                // if we have a path, we can travel
                // so we get all pixels, and add a timeout between each pixel, but the timeout is different for differents types of pixels
                let timeouts = [];
                for(let pixel of path){
                    let timeout = 0;
                    // get timeout from the pixel type
                    let pixeltype = this.getPixelType(pixel.pixel.type);
                    if(pixeltype) timeout = pixeltype.time;
                    timeouts.push(timeout);
                }

                // each 5 seconds, we update the user position
                let timeout = 0;
                for(let i = 0; i < path.length; i++){timeout += timeouts[i];}

                // get the actual timestamp
                let timestamp = Date.now();
                // start the timeout
                let finished = false;
                let interval = setInterval(async () => {
                    finished = true;
                    let eated = timeout / 1000;
                    let watered = timeout / 10000;
                    // we are finished, so we can update the user position
                    await client.usersdb.bulkWrite([
                        client.bulkutility.setField({
                            'id': id
                        }, {
                            'rpg.position.x': x,
                            'rpg.position.z': z
                        })
                    ])
                    /*
                    await client.usersdb.bulkWrite([
                        client.bulkutility.incrementField({
                            'id': id
                        }, {
                            'rpg.food': -eated,
                            'rpg.water': -watered
                        })
                    ])
                    */

                    // stop the interval
                    clearInterval(interval);
                    // call the finish callback
                    if(finishcallback) {
                        let dataReturn = path[path.length - 1];
                        let pixel = this.chunkManager.getCoordPixelAndChunk(x, z)?.pixel?.type;
                        dataReturn.type = this.getPixelType(pixel);
                        dataReturn.eated = eated;
                        dataReturn.watered = watered;
                        await finishcallback(dataReturn);
                    }
                }, timeout);

                // each 5 seconds while we are traveling (while finished is false), we update the user position
                while(!finished) {
                    // get the timeout done
                    let timeoutdone = Date.now() - timestamp;
                    // check at which pixel we are
                    let i = 0;
                    let timeout2 = 0;
                    for(let timeout1 of timeouts){
                        timeout2 += timeout1;
                        // if the timeout done is less than the timeout of the pixel, we are at this pixel
                        if(timeoutdone < timeout2){
                            // we are at this pixel
                            if(timeoutdone == timeout) break;
                            // update the callback
                            await updatefunction(path[i], Math.floor((timeoutdone / timeout) * 100));
                            break;
                        }
                        i++;
                    }
                    // wait 5 seconds
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                // true
                return true;
            }

            // basic gps with no road
            async gps(user, x, z, bypass = false){
                // if the user doesn't exist, return false
                console.log(`[GPS] Vérification de l'existence de l'utilisateur ${user.id}`);
                if(!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;
                console.log(`[GPS] L'utilisateur ${user.id} existe`);

                // VERIFICATIONS COORDONNEES ET EXISTANCES
                // get min and max coords
                console.log(`[GPS] Récupération des min et max coords`);
                let minmax = this.chunkManager.getMinMaxCoords();
                console.log(`[GPS] Les min et max coords ont été récupérées`);

                // check if x and y are valid
                console.log(`[GPS] Vérification de la validité des coords`);
                if(x < minmax.minx || x > minmax.maxx || z < minmax.minz || z > minmax.maxz) return false;
                console.log(`[GPS] Les coords sont valides`);

                // check if user x and y are valid
                console.log(`[GPS] Vérification de la validité des coords de l'utilisateur`);
                if(user.rpg.position.x < minmax.minx || user.rpg.position.x > minmax.maxx || user.rpg.position.z < minmax.minz || user.rpg.position.z > minmax.maxz) return false;
                console.log(`[GPS] Les coords de l'utilisateur sont valides`);

                // get the pixel and chunk
                console.log(`[GPS] Récupération et vérification du chunk et du pixel`);
                let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(x, z);
                if(!pixelAndChunk) return false;
                console.log(`[GPS] Le chunk et le pixel existent`);
                // verification de si on veut pas se déplacer sur de l'eau
                if(pixelAndChunk.pixel.type == 2 && !bypass) return false;
                console.log(`[GPS] Le pixel n'est pas de l'eau ou bien on a le baetau bypass`);

                // get the pixel and chunk of the user
                console.log(`[GPS] Récupération et vérification du chunk et du pixel de l'utilisateur`);
                let userPixelAndChunk = this.chunkManager.getCoordPixelAndChunk(user.rpg.position.x, user.rpg.position.z);
                if(!userPixelAndChunk) return false;
                console.log(`[GPS] Le chunk et le pixel de l'utilisateur existent`);

                // SUITE APRES LES VERIFS
                // get the line path between the two points (ALL THE PIXELS)
                console.log(`[GPS] Récupération du chemin (simple)`);
                let linepath = this.getLinePath(user.rpg.position.x, user.rpg.position.z, x, z);
                if(!linepath) return false;
                console.log(`[GPS] Le chemin a été récupéré`);

                // check all the pixels to know if we have water
                console.log(`[GPS] Vérification de la présence d'eau`);
                let water = false;
                for(let pixel of linepath){
                    if(pixel.pixel.type == 2) {
                        water = true;
                        console.log(`[GPS] Il y a de l'eau`);
                        break;
                    }
                }

                // if we don't have water, we can travel
                if(!water) {
                    console.log(`[GPS] Le GPS est terminé sans bateau`);
                    return linepath;
                }
                
                // if we have water and we don't have a boat
                if(bypass) {
                    console.log(`[GPS] Avec le bypass, on peut prendre un bateau donc le chemin en ligne droite est possible`);
                    return linepath;
                }

                // if we have water and we don't have a boat, we need to bypass the water
                console.log(`[GPS] Il y a de l'eau, on va donc contourner et prendre 10 fois plus de temps`);

                // create the pathfinder
                console.log(`[GPS] Création du pathfinder`);
                var finder = new PF.AStarFinder(
                    {
                        allowDiagonal: true,
                        dontCrossCorners: true
                    }
                );
                console.log(`[GPS] Le pathfinder a été créé`);
                
                // getMatrix
                console.log(`[GPS] Récupération de la matrice`);
                let matrix = this.getMatrix(minmax);
                console.log(`[GPS] La matrice a été récupérée`);

                // verifications des différentes coordonnées dans la matrice
                console.log(`[GPS] Vérification des différentes coordonnées début et fin dans la matrice`);
                if(user.rpg.position.x - minmax.minx < 0 || user.rpg.position.x - minmax.minx > matrix.length) {console.log(`[GPS] La coordonnée x de l'utilisateur n'est pas dans la matrice : ${user.rpg.position.x - minmax.minx} > ${matrix.length}`); return false;}
                if(user.rpg.position.z - minmax.minz < 0 || user.rpg.position.z - minmax.minz > matrix[0].length) {console.log(`[GPS] La coordonnée z de l'utilisateur n'est pas dans la matrice : ${user.rpg.position.z - minmax.minz} > ${matrix[0].length}`); return false;}
                if(x - minmax.minx < 0 || x - minmax.minx > matrix.length) {console.log(`[GPS] La coordonnée x de la destination n'est pas dans la matrice : ${x - minmax.minx} > ${matrix.length}`); return false;}
                if(z - minmax.minz < 0 || z - minmax.minz > matrix[0].length) {console.log(`[GPS] La coordonnée z de la destination n'est pas dans la matrice : ${z - minmax.minz} > ${matrix[0].length}`); return false;}
                console.log(`[GPS] Les différentes coordonnées début et fin sont dans la matrice`);

                // use the matrix to create the grid
                console.log(`[GPS] Création de la grille`);
                var grid = new PF.Grid(matrix);
                console.log(`[GPS] La grille a été créée`);

                // get the path
                console.log(`[GPS] Récupération du path`);
                try{
                    var path = finder.findPath(
                        user.rpg.position.x - minmax.minx, user.rpg.position.z - minmax.minz, // start
                        x - minmax.minx, z - minmax.minz, // end
                        grid // grid
                    );
                }catch(err){console.log(`[GPS] Catastrophe, le pathfinder a crashé : ${err.stack}`); return false;}
                console.log(`[GPS] Le path a été récupéré`);

                // if we don't have a path, return false
                if(!path || path.length == 0) {
                    console.log(`[GPS] Aucun chemin n'a été trouvé`);
                    return false;
                }

                // transform the coords to the real coords
                console.log(`[GPS] Transformation des coords`);
                let finalpath = [];
                for(let coords of path){
                    finalpath.push({
                        x: coords[0] + minmax.minx,
                        z: coords[1] + minmax.minz
                    });
                }
                console.log(`[GPS] Les coords ont été transformées`);

                // get the line path between the two points (ALL THE PIXELS)
                console.log(`[GPS] Récupération du chemin (complexe)`);
                let finalLinePath = [];
                for(let i = 0; i < finalpath.length; i++){
                    if(i+1 >= finalpath.length) break;

                    let coords1 = finalpath[i];
                    let coords2 = finalpath[i + 1];

                    // get the paths between the two points
                    let linepath = this.getLinePath(coords1.x, coords1.z, coords2.x, coords2.z);
                    if(!linepath) return false;

                    // add the paths to the final path
                    for(let pixel of linepath){ finalLinePath.push(pixel); }
                }

                // remove the duplicates
                finalLinePath = finalLinePath.filter((element, index, array) => {
                    return array.findIndex((element2) => element2.x == element.x && element2.z == element.z) == index;
                });

                console.log(`[GPS] Le chemin a été récupéré`);
                // now we can travel

                console.log(`[GPS] Le GPS est terminé avec succès en contournant l'eau`);
                return finalLinePath;
            }

            getMatrix(minmax){
                // create the matrix of the map
                // in the matrix, there are arrays which are for each x, and in each array there are 0 and 1, 1 for water and 0 for land
                let matrix = [];
                
                // we will start for 0 for the min x and z
                // for each chunk
                for(let chunk of this.chunkManager.chunks){
                    // if the chunk is not in the render distance, continue
                    let chunkX = chunk.position.x - minmax.minx;
                    let chunkZ = chunk.position.z - minmax.minz;

                    for(let x = 0; x < this.chunkManager.chunksize; x++){
                        // if the x is not in the render distance, continue
                        //if(chunkX + x < 0 || chunkX + x > this.chunkManager.chunksize * this.loadDistance) continue;
                        
                        // if the x doesn't exist in the matrix, create it
                        if(!matrix[chunkX + x]) matrix[chunkX + x] = [];
                        for(let z = 0; z < this.chunkManager.chunksize; z++){
                            // if the z is not in the render distance, continue
                            //if(chunkZ + z < 0 || chunkZ + z > this.chunkManager.chunksize * this.loadDistance) continue;

                            // if the z doesn't exist in the matrix, create it
                            if(!matrix[chunkX + x][chunkZ + z]) matrix[chunkX + x][chunkZ + z] = 0;
                            // if the pixel is water, set the value to 1
                            if(chunk.pixels[z * this.chunkManager.chunksize + x].type == 2) matrix[chunkX + x][chunkZ + z] = 1;
                        }
                    }
                }
                return matrix;
            }

            // get the line path between two points
            getLinePath(x1, z1, x2, z2){
                // get all points between the two points, and their informations coords, chunk, pixel
                let points = [];
                // get the distance between the two points
                let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
                // get the number of points between the two points
                let numberofpoints = Math.floor(distance);
                // get the x and z step
                let xstep = (x2 - x1) / numberofpoints;
                let zstep = (z2 - z1) / numberofpoints;
                // get the current x and z
                let x = x1;
                let z = z1;
                // for each point
                for(let i = 0; i < numberofpoints; i++){
                    // get the pixel and chunk
                    let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(Math.round(x), Math.round(z));
                    // if the pixel and chunk doesn't exist, return false
                    if(!pixelAndChunk) return false;
                    // add the point
                    points.push({
                        x: Math.round(x),
                        z: Math.round(z),
                        chunk: pixelAndChunk.chunk,
                        pixel: pixelAndChunk.pixel
                    });
                    // add the step
                    x += xstep;
                    z += zstep;
                }
                // remove the duplicates
                points = points.filter((element, index, array) => {
                    return array.findIndex((element2) => element2.x == element.x && element2.z == element.z) == index;
                });
                // return the points
                return points;
            }
        }
        
        class Camera {
            constructor(position, renderDistance){
                this.position = position;
                this.speed = 100;
                this.renderDistance = renderDistance;
            }
            move(dx, dz){
                this.position.x += dx * this.speed;
                this.position.z += dz * this.speed;
            }
        }
        
        class TerrainGenerator {
            constructor(noiseGenerator, snowLevel, chunksize, PixelType){
                this.noiseGenerator = noiseGenerator;
                this.chunk = null;
                this.configs = {
                    octaves: 9,
                    amplitude: 100,
                    persistance: 0.7,
                    smoothness: 250
                }
                 /*Octaves : Il s'agit du nombre d'octaves utilisées pour générer le bruit. Chaque octave est une couche de bruit superposée à différentes échelles. Augmenter le nombre d'octaves ajoute des détails plus fins au bruit généré, mais cela peut également augmenter le temps de calcul.
                Amplitude : C'est l'amplitude de chaque octave. L'amplitude contrôle l'amplitude du bruit généré. Une amplitude plus élevée signifie que le bruit aura des variations plus importantes entre les valeurs minimales et maximales.
                Persistance : Il s'agit de la persistance du bruit, qui contrôle à quel point chaque octave influence le résultat final. Une persistance plus élevée signifie que les octaves supérieures auront un impact plus important sur le bruit généré, ce qui peut donner une apparence plus rugueuse ou cahoteuse.
                Smoothness : C'est une valeur qui contrôle la "lissité" du bruit généré. Une valeur plus élevée de smoothness donne un bruit plus doux avec des transitions plus progressives entre les valeurs, tandis qu'une valeur plus basse donne un bruit plus rugueux avec des transitions plus abruptes.*/
                this.noiseGenerator.setConfigs(this.configs);
                
                this.snowLevel = snowLevel;
                this.chunksize = chunksize;
                this.PixelType = PixelType;
            }
        
            generate(chunk) {
                this.chunk = chunk;
                const heightMap = this.getHeightMap()
                for (var x = 0; x < this.chunksize; x++) {
                    for (var z = 0; z < this.chunksize; z++) {
                        var h = heightMap[x][z];
                        // sort the pixel type by level
                        let newPixelType = this.PixelType.sort((a, b) => a.level - b.level);
                        // now automatically set the pixel type
                        for(let value of newPixelType) {
                            if(h < value.level){
                                chunk.setPixel(x, z, value.id, h / value.level);
                                break;
                            }
                        }
                    }
                }
            }
        
            getHeightAt(x, z) {
                const h = this.noiseGenerator.perlinNoise(this.chunk.position.x + x, this.chunk.position.z + z);
                return h / this.snowLevel;
            }
        
            getHeightIn(heights, xMin, zMin, xMax, zMax) {
                const bottomLeft = this.getHeightAt(xMin, zMin);
                const bottomRight = this.getHeightAt(xMax, zMin);
                const topLeft = this.getHeightAt(xMin, zMax);
                const topRight = this.getHeightAt(xMax, zMax);
                for (var x = xMin; x < xMax; x++) {
                    for (var z = zMin; z < zMax; z++) {
                        if (x === this.chunksize) continue;
                        if (z === this.chunksize) continue;
        
                        var h = Maths.smoothInterpolation(bottomLeft, topLeft, bottomRight, topRight, xMin, xMax, zMin, zMax, x, z);
                        if (!heights[x]) heights[x] = [];
        
                        heights[x][z] = h;
                    }
                }
            }
        
            getHeightMap() {
                const part = 2;
                const partsize = this.chunksize / part;
                var heights = [];
                for (var zPart = 0; zPart < part; zPart++) {
                    for (var xPart = 0; xPart < part; xPart++) {
                        this.getHeightIn(
                            heights,
                            xPart * partsize,
                            zPart * partsize,
                            (xPart + 1) * partsize,
                            (zPart + 1) * partsize
                        )
                    }
                }
                return heights;
            }
        }
        
        class NoiseGenerator{
            constructor(seed, chunksize){
                this.seed = seed;
                this.chunksize = chunksize;
                this.configs = {
                    octaves: 9,
                    amplitude: 80,
                    persistance: 0.51,
                    smoothness: 250
                }
            }
        
            setSeed(seed){
                this.seed = seed;
            }
        
            getSeed(){
                return this.seed;
            }
        
            setConfigs(configs){
                this.configs = configs;
            }
        
            noise(x, z){
                const integerX = parseInt(x);
                const integerZ = parseInt(z);
            
                const fractionalX = x - integerX;
                const fractionalZ = z - integerZ;
        
                const a = this.getNoise(integerX, integerZ);
                const b = this.getNoise(integerX + 1, integerZ);
        
                const c = this.getNoise(integerX, integerZ + 1);
                const d = this.getNoise(integerX + 1, integerZ + 1);
        
                const f = this.cosineInterpolate(a, b, fractionalX);
                const g = this.cosineInterpolate(c, d, fractionalZ);
        
                const result = this.cosineInterpolate(f, g, fractionalZ);
        
                return result;
            }
        
            getNoiseValue(t){
                t += this.seed;
                t = BigInt((t << 13) ^ t);
                t = (t * (t * t * 15731n + 789221n) + 1376312589n);
                t = parseInt(t.toString(2).slice(-31), 2);
        
                return 1.0 - t / 1073741824;
            }
        
            getNoise(x, z){
                return this.getNoiseValue(x + z * this.chunksize);
            }
        
            cosineInterpolate(a, b, t){
                const c = (1 - Math.cos(t * 3.1415927)) * .5;
                return (1. - c) * a + c * b;
            }
        
            perlinNoise(x, z){
                var r = 0;
                for (var i = 0; i <= this.configs.octaves; i++) {
                    var frequency = Math.pow(2, i);
                    var amplitude = Math.pow(this.configs.persistance, i);
                    var noise = this.noise(x * frequency / this.configs.smoothness, z * frequency / this.configs.smoothness);
                    r += noise * amplitude;
                }
                var result = (r / 2 + 1) * this.configs.amplitude - 20;
                return result > 0 ? result : 1;
            }
        }
        
        class Maths{
            static smoothInterpolation(
                bottomLeft, topLeft, bottomRight, topRight,
                xMin, xMax,
                zMin, zMax,
                x, z
            ) {
                var width = xMax - xMin,
                    height = zMax - zMin;
        
                var xValue = 1 - (x - xMin) / width;
                var zValue = 1 - (z - zMin) / height;
        
                var a = this.smoothstep(bottomLeft, bottomRight, xValue);
                var b = this.smoothstep(topLeft, topRight, xValue);
                return this.smoothstep(a, b, zValue);
            }
        
            static smoothstep(edge0, edge1, x) {
                x = x * x * (3 - 2 * x);
                return (edge0 * x) + (edge1 * (1 - x));
            }
        }
        
        // chunk manager begin
        
        class ChunkManager{
            constructor(noiseGenerator, chunksize, snowLevel, PixelType){
                this.chunks = [];
                this.terrainGenerator = new TerrainGenerator(noiseGenerator, snowLevel, chunksize, PixelType);
                
                this.chunksize = chunksize;
            }
        
            getCoordPixelAndChunk(x, z){
                // it is the x and the z of the pixel
                let xChunk = Math.floor(x / this.chunksize) * this.chunksize;
                let zChunk = Math.floor(z / this.chunksize) * this.chunksize;
                const chunk = this.getChunkAt(xChunk, zChunk);
                if(chunk){
                    let xPixel = x - xChunk;
                    let zPixel = z - zChunk;
                    const pixel = chunk.pixels[zPixel * this.chunksize + xPixel];
                    if(pixel){
                        pixel.x = x;
                        pixel.z = z;
                        return {
                            chunk: {x: chunk.position.x, z: chunk.position.z},
                            pixel: pixel
                        }
                    } else console.log('pixel not found, x:', xPixel, 'z:', zPixel, 'position:', (zPixel * this.chunksize + xPixel));
                } else console.log('chunk not found, x:', xChunk, 'z:', zChunk);
                console.log("Not found", x, z);
                return false;
            }

            getMinMaxCoords(){
                if(this.maxcord) return this.maxcord;
                else {
                    // get the max and min coords of the pixels
                    let chunks = this.chunks;
                    let minx = chunks[0].position.x;
                    let minz = chunks[0].position.z;
                    let maxx = 0;
                    let maxz = 0;
                    for(let chunk of chunks){
                        // using chunksize because the pixel does not contains any x or y
                        for(let i = 0; i < this.chunksize; i++){
                            for(let j = 0; j < this.chunksize; j++){
                                if(chunk.pixels[j * this.chunksize + i]){
                                    if(parseInt(chunk.position.x) + i < minx) minx = parseInt(chunk.position.x) + i;
                                    if(parseInt(chunk.position.z) + j < minz) minz = parseInt(chunk.position.z) + j;
                                    if(parseInt(chunk.position.x) + i > maxx) maxx = parseInt(chunk.position.x) + i;
                                    if(parseInt(chunk.position.z) + j > maxz) maxz = parseInt(chunk.position.z) + j;
                                }
                            }
                        }
                    }
                    this.maxcord = {
                        minx: minx,
                        minz: minz,
                        maxx: maxx,
                        maxz: maxz
                    }
                    return this.maxcord;
                }
            }

            loadChunks(loadDistance, camera) {
                var cameraX = parseInt(camera.position.x / this.chunksize);
                var cameraZ = parseInt(camera.position.z / this.chunksize);
                for (var i = 0; i < loadDistance; i++) {
                    const minX = Math.max(cameraX - i, 0);
                    const minZ = Math.max(cameraZ - i, 0);
                    const maxX = cameraX + i;
                    const maxZ = cameraZ + i;
                    for (var x = minX; x < maxX; x++) {
                        for (var z = minZ; z < maxZ; z++) {
                            this.loadChunk(x * this.chunksize, z * this.chunksize);
                        }
                    }
                }
            }
        
            getChunkAt(x, z){
                return this.chunks.find((element) => element.position.x === x && element.position.z === z);
            }
        
            getChunk(x, z){
                const chunk = this.getChunkAt(x, z);
                if(!chunk){
                    const element = new Chunk({ x, z }, this.chunksize);
                    this.chunks.push(element);
                }
                return this.getChunkAt(x, z);
            }
        
            loadChunk(x, z){
                var chunk = this.getChunk(x, z);
                chunk.load(this.terrainGenerator);
            }
        
            // function to get all the chunks
            get(){
                // get all the chunks
                let chunks = this.chunks;
                // delete chunksize
                for(let chunk of chunks){
                    delete chunk.chunksize;
                    delete chunk.isLoaded;
                }
                // return the chunks
                return chunks;
            }
        
            // function to load all the chunks
            load(chunks){
                // set the chunks
                for(let chunk of chunks){
                    let newChunk = new Chunk(chunk.position, this.chunksize);
                    newChunk.pixels = chunk.pixels;
                    newChunk.isLoaded = true;
                    this.chunks.push(newChunk);
                }
            }
        }
        
        class Pixel{
            constructor(){
                this.type = 0;
                this.heightMap = 1;
            }
        }
        
        class Chunk {
            constructor(position, chunksize){
                this.pixels = new Array(chunksize * chunksize);
                this.isLoaded = false;
                this.position = position;
        
                this.chunksize = chunksize;
            }
        
            load(generator) {
                if (!this.isLoaded) {
                    generator.generate(this);
                    this.isLoaded = true;
                }
            }
        
            setPixel(x, z, type, heightMap) {
                if (!this.pixels[z * this.chunksize + x]) this.pixels[z * this.chunksize + x] = new Pixel();
        
                this.pixels[z * this.chunksize + x].type = type;
                this.pixels[z * this.chunksize + x].heightMap = heightMap;
            }
        }
        
        // export all the classes
        
        class Renderer {
            constructor(type, chunksize, canvas, context){
                this.meshes = [];
                this.allmeshes = [];
                this.type = type || "canvas";
                this.chunksize = chunksize;
                this.finaltext = "";
                this.canvas = canvas;
                this.context = context;
            }
        
            // get difference between 2 numbers (compatible with negative numbers)
            getDiff(number1, number2){
                return Math.abs(number1 - number2);
            }
                
            draw(camera, chunkManager, points, players){
                var cameraX = parseInt(camera.position.x / this.chunksize);
                var cameraZ = parseInt(camera.position.z / this.chunksize);
                for (var i = 0; i < camera.renderDistance; i++) {
                    const minX = Math.max(cameraX - i, 0);
                    const minZ = Math.max(cameraZ - i, 0);
                    const maxX = cameraX + i;
                    const maxZ = cameraZ + i;
                    for (var x = minX; x < maxX; x++) {
                        for (var z = minZ; z < maxZ; z++) {
                            let posx = x * this.chunksize;
                            let posz = z * this.chunksize;
                            // if the mesh is not already in the meshes array
                            if(!this.meshes.find((e) => e.position.x == posx &&e.position.z == posz)){
                                if(this.allmeshes.find((e) => e.position.x == posx && e.position.z == posz)){
                                    // get the already existing mesh
                                    let mesh = this.allmeshes.find((e) => e.position.x == posx &&e.position.z == posz);
                                    // add the mesh to the meshes array
                                    this.meshes.push(mesh);
                                    continue;
                                } else {
                                    // create and configure the mesh
                                    let newMesh = new Mesh({x: posx, z: posz}, this.type, this.chunksize, this.context);
                                    // find chunk
                                    let pixels = chunkManager.getChunk(posx, posz).pixels
                                    newMesh.add(pixels);
                                    // add the mesh to the meshes array
                                    this.meshes.push(newMesh);
                                    continue;
                                }
                            }
                        }
                    }
                }
                let meshes = this.meshes.sort((a, b) => a.position.z - b.position.z);
                meshes = meshes.sort((a, b) => a.position.x - b.position.x);
                if(this.type == "canvas"){
                    // get minimum x and z
                    let minx = meshes[0].position.x;
                    let minz = meshes[0].position.z;
                    let maxx = 0;
                    let maxz = 0;
                    for(var iMesh in meshes) {
                        const mesh = meshes[iMesh];
                        if(mesh.position.x < minx) minx = mesh.position.x;
                        if(mesh.position.z < minz) minz = mesh.position.z;
                        if(mesh.position.x > maxx) maxx = mesh.position.x;
                        if(mesh.position.z > maxz) maxz = mesh.position.z;
                    }
                    if(this.canvas) {
                        this.canvas.width = this.getDiff(minx, maxx) + this.chunksize;
                        this.canvas.height = this.getDiff(minz, maxz) + this.chunksize;
                    }
                    for(var iMesh in meshes) {
                        const mesh = meshes[iMesh];
                        const meshX = parseInt(mesh.position.x) - minx;
                        const meshZ = parseInt(mesh.position.z) - minz;
                        this.context.putImageData(mesh.imgData, meshX, meshZ);
                    }

                    // points time if there is points
                    if(points){
                        for(var iPoint in points){
                            // points have :
                            //x, z, type, name, owner, width, height, color
                            
                            // get the point
                            let point = points[iPoint];

                            // change the x and z to minx and minz
                            point.x = point.x - minx;
                            point.z = point.z - minz;

                            // if x < 0 or z < 0 or x > canvas.width or z > canvas.height, then continue
                            if(point.x < 0 || point.z < 0 || point.x > this.canvas.width || point.z > this.canvas.height) continue;

                            // create an transparent overlay, the point x and y is the center of the point
                            // add transparency to the color and convert #ffffff to rgba(255, 255, 255, 0.5)
                            if(color) {
                                let newcolor = point.color.replace('#', '');
                                let r = parseInt(newcolor.substring(0, 2), 16);
                                let g = parseInt(newcolor.substring(2, 4), 16);
                                let b = parseInt(newcolor.substring(4, 6), 16);
                                let a = 0.5;
                                this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                            } else {
                                this.context.fillStyle = "rgba(255, 255, 255, 0.5)";
                            }

                            this.context.fillRect(point.x - point.width / 2, point.z - point.height / 2, point.width, point.height);

                            const fs = require('fs');
                            const path = require('path');

                            // icon 
                            if(icon) {
                                // load the image
                                let image = fs.readFileSync(path.join(__dirname, `../assets/icons/${point.icon}`));
                                // create the image
                                let img = new Image();
                                img.src = image;
                                // draw the image
                                this.context.drawImage(img, point.x - point.width / 2, point.z - point.height / 2, point.width, point.height);
                            }

                            // create the text
                            this.context.fillStyle = "white";
                            this.context.font = "30px Arial";
                            this.context.fillText(point.name, point.x - point.width / 2, point.z - point.height / 2);
                        }
                    }

                    if(players) {
                        // players time
                        for(var iPlayer in players){
                            // players have :
                            // x, y
                            
                            // get the player
                            let player = players[iPlayer];

                            // change the x and z to minx and minz
                            player.x = player.x - minx;
                            player.z = player.z - minz;

                            // if x < 0 or z < 0 or x > canvas.width or z > canvas.height, then continue
                            if(player.x < 0 || player.z < 0 || player.x > this.canvas.width || player.z > this.canvas.height) continue;

                            // define the height and width of the player
                            let height = 11;
                            let width = 11;
                            let heightpos = height-1;
                            let widthpos = width-1;
                            let font = (height + width) / 2 + 10;

                            // create an opaque white overlay, the player x and y is the center of the player
                            this.context.fillStyle = "rgba(255, 255, 255, 1)";
                            this.context.fillRect(
                                player.x - heightpos / 2, // x
                                player.z - widthpos / 2, // y
                                width, // width
                                height // height
                            );

                            // create an opaque red overlay, the player x and y is the center of the player
                            this.context.fillStyle = "rgba(255, 0, 0, 1)";
                            this.context.fillRect(
                                player.x - (heightpos-2) / 2, // x
                                player.z - (widthpos-2) / 2, // y
                                width-2, // width
                                height-2 // height
                            );

                            // create an opaque red overlay, the player x and y is the center of the player
                            this.context.fillStyle = "rgba(255, 255, 255, 1)";
                            this.context.fillRect(
                                player.x, // x
                                player.z, // y
                                1, // width
                                1 // height
                            );

                            // create the text
                            this.context.fillStyle = "white";
                            this.context.font = `${font}px Arial`;
                            this.context.textAlign = "center";
                            this.context.fillText(
                                player.name, // text
                                player.x, // x
                                player.z - height - 2 // y
                            );
                        }
                    }
                    
                    // return the context canvas result
                    if(this.canvas) {
                        // return the context canvas result
                        return this.canvas.toBuffer("image/png");
                    }
                    // 
                    /*for(var iMesh in this.meshes){
                        const mesh = this.meshes[iMesh]
                        const cameraViewX = camera.position.x - window.innerWidth / 2
                        const cameraViewZ = camera.position.z - window.innerHeight / 2
                        const meshX = parseInt(mesh.position.x) - cameraViewX
                        const meshZ = parseInt(mesh.position.z) - cameraViewZ
                        this.context.putImageData(mesh.imgData, meshX, meshZ)
                    }*/

                } else if(this.type == "text"){
                    let rows = [];
                    for(var iMesh in meshes) {
                        const mesh = meshes[iMesh];
                        // rows += mesh.rows with same x
                        for(var iRow in mesh.rows){
                            const row = mesh.rows[iRow];
                            if(!rows.find((element) => element.y === row.y)){
                                rows.push({y: row.y, row: ''});
                            }
                            var row2 = rows.find((element) => element.y === row.y);
                            row2.row += row.row;
                        }
                    }
                    // sort the rows by x
                    rows = rows.sort((a, b) => a.x - b.x);
                    // join the rows array into a string
                    this.finaltext = rows.map((element) => element.row).join('\n');
                    // set the text to the finaltext
                    return this.finaltext;
                }
                // add to the allmeshes array the meshes array
                this.allmeshes = this.allmeshes.concat(this.meshes);
                // clear the meshes array
                this.meshes = [];
            }
        }
        
        // render with canvas or text
        class Mesh{
            constructor(position, type, chunksize, context){
                this.position = position;
                this.type = type || "canvas";
                this.chunksize = chunksize;
                if(type == "canvas"){
                    this.imgData = context.createImageData(this.chunksize, this.chunksize);
                    this.data = this.imgData.data;
                } else if(type == "text"){
                    this.rows = [];
                }
            }
        
            add(pixels){
                // canvas for navigator
                if(this.type == "canvas"){
                    var l = this.data.length;
                    for(var i = 0; i < l; i += 4){
                        var pixel = pixels[i / 4];
                        var rgb = null;
        
                        rgb = PixelType.find((element) => element.id === pixel.type).rgb;
        
                        var bias = this.bias(pixel.heightMap);
                        this.data[i] = rgb[0] * bias;
                        this.data[i + 1] = rgb[1] * bias;
                        this.data[i + 2] = rgb[2] * bias;
                        this.data[i + 3] = 255;
                    }
                // text for node js and navigator
                } else if(this.type == "text"){
                    var l = this.chunksize * this.chunksize;
                    for(var i = 0; i < l; i++){
                        var pixel = pixels[i];
                        // pixelrow is the row of the pixel (if 0.5, then it is 1)
                        let pixelrow = parseInt(i / this.chunksize);
                        let y = pixelrow + this.position.z;
                        if(!this.rows.find((e) => e.y == y)) this.rows.push({y: y, row: []});
                        var row = this.rows.find((e) => e.y == y);
                        var emoji = PixelType.find((e) => e.id == pixel.type).emoji;
                        row.row += emoji;
                    }
                }
            }
        
            bias(heightMap){
                var dark = 0.75;
                var light = 1;
                return light * heightMap + dark * (1 - heightMap);
            }
        }

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
            RENDER_TYPE,
            camera,
            noiseGenerator,
            LOAD_DISTANCE,
            CHUNK_SIZE,
            SNOW_LEVEL,
            PixelType
        );

        async function start(){
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
            if(data) app.load(data);
            
            // generate the map
            app.run();

            // if the map doesn't exists, save it
            if(!data) {
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