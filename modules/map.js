const { createCanvas } = require('@napi-rs/canvas')
var PF = require('pathfinding');

class Maths {
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

class NoiseGenerator {
    constructor(seed, chunksize) {
        this.seed = seed;
        this.chunksize = chunksize;
        this.configs = {
            octaves: 6,
            amplitude: 150,
            persistance: 0.7,
            smoothness: 250
        }
    }

    setSeed(seed) {
        this.seed = seed;
    }

    getSeed() {
        return this.seed;
    }

    setConfigs(configs) {
        this.configs = configs;
    }

    noise(x, z) {
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

    getNoiseValue(t) {
        t += this.seed;
        t = BigInt((t << 13) ^ t);
        t = (t * (t * t * 15731n + 789221n) + 1376312589n);

        return 1.0 - Number(t) / 1073741824;
    }

    getNoise(x, z) {
        return this.getNoiseValue(x + z * this.chunksize);
    }

    cosineInterpolate(a, b, t) {
        const c = (1 - Math.cos(t * 3.1415927)) * .5;
        return (1. - c) * a + c * b;
    }

    perlinNoise(x, z) {
        var r = 0;
        for (var i = 0; i <= this.configs.octaves; i++) {
            var frequency = Math.pow(2, i);
            var amplitude = Math.pow(this.configs.persistance, i);

            var noise = this.noise(x * frequency / this.configs.smoothness, z * frequency / this.configs.smoothness);
            r += noise * amplitude;
        }

        const result = r * this.configs.amplitude;

        return result > 0 ? result : 1;
    }
}

class TerrainGenerator {
    constructor(noiseGenerator, snowLevel, chunksize, PixelType) {
        this.noiseGenerator = noiseGenerator;
        this.chunk = null;
        this.configs = {
            octaves: 6,
            amplitude: 150,
            persistance: 0.7,
            smoothness: 250
        }
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
                const h = heightMap[x][z];
                let newPixelType = this.PixelType.sort((a, b) => a.level - b.level);
                for (let value of newPixelType) {
                    if (h < value.level) {
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
        let heights = [];

        for (var z = 0; z < part; z++) {
            for (var x = 0; x < part; x++) {
                this.getHeightIn(
                    heights,
                    x * partsize,
                    z * partsize,
                    (x + 1) * partsize,
                    (z + 1) * partsize
                );
            }
        }

        return heights;
    }
}

class Pixel {
    constructor() {
        this.type = 0;
        this.heightMap = 1;
    }
}

class Chunk {
    constructor(position, chunksize) {
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

class ChunkManager {
    constructor(noiseGenerator, chunksize, snowLevel, PixelType) {
        this.chunks = [];
        this.chunkMap = new Map();
        this.terrainGenerator = new TerrainGenerator(noiseGenerator, snowLevel, chunksize, PixelType);

        this.chunksize = chunksize;
    }

    getCoordPixelAndChunk(x, z) {
        let xChunk = Math.floor(x / this.chunksize) * this.chunksize;
        let zChunk = Math.floor(z / this.chunksize) * this.chunksize;
        const chunk = this.getChunkAt(xChunk, zChunk);
        if (chunk) {
            let xPixel = x - xChunk;
            let zPixel = z - zChunk;
            const pixel = chunk.pixels[zPixel * this.chunksize + xPixel];
            if (pixel) {
                pixel.x = x;
                pixel.z = z;
                return {
                    chunk: { x: chunk.position.x, z: chunk.position.z },
                    pixel: pixel
                }
            } else console.log('pixel not found, x:', xPixel, 'z:', zPixel, 'position:', (zPixel * this.chunksize + xPixel));
        } else console.log('chunk not found, x:', xChunk, 'z:', zChunk);
        console.log("Not found", x, z);
        return false;
    }

    getMinMaxCoords() {
        if (this.maxcord) return this.maxcord;
        else {
            let minx = Infinity;
            let minz = Infinity;
            let maxx = -Infinity;
            let maxz = -Infinity;
            for (let chunk of this.chunks) {
                if (chunk.position.x < minx) minx = chunk.position.x;
                if (chunk.position.z < minz) minz = chunk.position.z;
                if (chunk.position.x > maxx) maxx = chunk.position.x;
                if (chunk.position.z > maxz) maxz = chunk.position.z;
            }
            if (minx === Infinity) {
                minx = 0; minz = 0; maxx = 0; maxz = 0;
            } else {
                maxx += this.chunksize - 1;
                maxz += this.chunksize - 1;
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

    getChunkAt(x, z) {
        return this.chunkMap.get(`${x},${z}`);
    }

    getChunk(x, z) {
        let chunk = this.getChunkAt(x, z);
        if (!chunk) {
            chunk = new Chunk({ x, z }, this.chunksize);
            this.chunks.push(chunk);
            this.chunkMap.set(`${x},${z}`, chunk);
        }
        return chunk;
    }

    loadChunk(x, z) {
        var chunk = this.getChunk(x, z);
        chunk.load(this.terrainGenerator);
    }

    get() {
        let chunks = this.chunks;
        for (let chunk of chunks) {
            delete chunk.chunksize;
            delete chunk.isLoaded;
        }
        return chunks;
    }

    load(chunks) {
        for (let chunk of chunks) {
            let newChunk = new Chunk(chunk.position, this.chunksize);
            newChunk.pixels = chunk.pixels;
            newChunk.isLoaded = true;
            this.chunks.push(newChunk);
            this.chunkMap.set(`${chunk.position.x},${chunk.position.z}`, newChunk);
        }
    }
}

class Mesh {
    constructor(position, type, chunksize, context) {
        this.position = position;
        this.type = type || "canvas";
        this.chunksize = chunksize;
        if (type == "canvas") {
            this.imgData = context.createImageData(this.chunksize, this.chunksize);
            this.data = this.imgData.data;
        } else if (type == "text") {
            this.rows = [];
        }
        this.PixelType = [];
    }

    setPixelType(PixelType) {
        this.PixelType = PixelType;
    }

    add(pixels) {
        if (this.type == "canvas") {
            var l = this.data.length;
            for (var i = 0; i < l; i += 4) {
                var pixel = pixels[i / 4];
                var rgb = null;

                rgb = this.PixelType.find((element) => element.id === pixel.type).rgb;

                var bias = this.bias(pixel.heightMap);
                this.data[i] = rgb[0] * bias;
                this.data[i + 1] = rgb[1] * bias;
                this.data[i + 2] = rgb[2] * bias;
                this.data[i + 3] = 255;
            }
        } else if (this.type == "text") {
            var l = this.chunksize * this.chunksize;
            for (var i = 0; i < l; i++) {
                var pixel = pixels[i];
                let pixelrow = parseInt(i / this.chunksize);
                let y = pixelrow + this.position.z;
                if (!this.rows.find((e) => e.y == y)) this.rows.push({ y: y, row: [] });
                var row = this.rows.find((e) => e.y == y);
                var emoji = this.PixelType.find((e) => e.id == pixel.type).emoji;
                row.row += emoji;
            }
        }
    }

    bias(heightMap) {
        var dark = 0.75;
        var light = 1;
        return light * heightMap + dark * (1 - heightMap);
    }
}

class Renderer {
    constructor(type, chunksize, canvas, context, PixelType) {
        this.meshes = [];
        this.allmeshMap = new Map();
        this.type = type || "canvas";
        this.chunksize = chunksize;
        this.finaltext = "";
        this.canvas = canvas;
        this.context = context;
        this.PixelType = PixelType;
    }

    getDiff(number1, number2) {
        return Math.abs(number1 - number2);
    }

    draw(camera, chunkManager, points, players) {
        var cameraX = parseInt(camera.position.x / this.chunksize);
        var cameraZ = parseInt(camera.position.z / this.chunksize);

        const minX = Math.max(cameraX - camera.renderDistance, 0);
        const minZ = Math.max(cameraZ - camera.renderDistance, 0);
        const maxX = cameraX + camera.renderDistance;
        const maxZ = cameraZ + camera.renderDistance;

        let currentMeshes = [];

        for (var x = minX; x < maxX; x++) {
            for (var z = minZ; z < maxZ; z++) {
                let posx = x * this.chunksize;
                let posz = z * this.chunksize;
                let mapKey = `${posx},${posz}`;

                if (this.allmeshMap.has(mapKey)) {
                    currentMeshes.push(this.allmeshMap.get(mapKey));
                } else {
                    let newMesh = new Mesh({ x: posx, z: posz }, this.type, this.chunksize, this.context);
                    newMesh.setPixelType(this.PixelType);
                    let pixels = chunkManager.getChunk(posx, posz).pixels;
                    newMesh.add(pixels);
                    currentMeshes.push(newMesh);
                    this.allmeshMap.set(mapKey, newMesh);
                }
            }
        }

        let meshes = currentMeshes.sort((a, b) => a.position.z - b.position.z);
        meshes = meshes.sort((a, b) => a.position.x - b.position.x);
        if (this.type == "canvas") {
            let minx = meshes[0].position.x;
            let minz = meshes[0].position.z;
            let maxx = 0;
            let maxz = 0;
            for (var iMesh in meshes) {
                const mesh = meshes[iMesh];
                if (mesh.position.x < minx) minx = mesh.position.x;
                if (mesh.position.z < minz) minz = mesh.position.z;
                if (mesh.position.x > maxx) maxx = mesh.position.x;
                if (mesh.position.z > maxz) maxz = mesh.position.z;
            }
            if (this.canvas) {
                this.canvas.width = this.getDiff(minx, maxx) + this.chunksize;
                this.canvas.height = this.getDiff(minz, maxz) + this.chunksize;
            }
            for (var iMesh in meshes) {
                const mesh = meshes[iMesh];
                const meshX = parseInt(mesh.position.x) - minx;
                const meshZ = parseInt(mesh.position.z) - minz;
                this.context.putImageData(mesh.imgData, meshX, meshZ);
            }

            if (points) {
                for (var iPoint in points) {
                    let point = points[iPoint];

                    point.x = point.x - minx;
                    point.z = point.z - minz;

                    if (point.x < 0 || point.z < 0 || point.x > this.canvas.width || point.z > this.canvas.height) continue;

                    if (point.color) {
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

                    if (point.icon) {
                        let image = fs.readFileSync(path.join(__dirname, `../assets/icons/${point.icon}`));
                        let img = new Image();
                        img.src = image;
                        this.context.drawImage(img, point.x - point.width / 2, point.z - point.height / 2, point.width, point.height);
                    }

                    this.context.fillStyle = "white";
                    this.context.font = "30px Arial";
                    this.context.fillText(point.name, point.x - point.width / 2, point.z - point.height / 2);
                }
            }

            if (players) {
                for (var iPlayer in players) {
                    let player = players[iPlayer];

                    player.x = player.x - minx;
                    player.z = player.z - minz;

                    if (player.x < 0 || player.z < 0 || player.x > this.canvas.width || player.z > this.canvas.height) continue;

                    let height = 11;
                    let width = 11;
                    let heightpos = height - 1;
                    let widthpos = width - 1;
                    let font = (height + width) / 2 + 10;

                    this.context.fillStyle = "rgba(255, 255, 255, 1)";
                    this.context.fillRect(
                        player.x - heightpos / 2,
                        player.z - widthpos / 2,
                        width,
                        height
                    );

                    this.context.fillStyle = "rgba(255, 0, 0, 1)";
                    this.context.fillRect(
                        player.x - (heightpos - 2) / 2,
                        player.z - (widthpos - 2) / 2,
                        width - 2,
                        height - 2
                    );

                    this.context.fillStyle = "rgba(255, 255, 255, 1)";
                    this.context.fillRect(
                        player.x,
                        player.z,
                        1,
                        1
                    );

                    this.context.fillStyle = "white";
                    this.context.font = `${font}px Arial`;
                    this.context.textAlign = "center";
                    this.context.fillText(
                        player.name,
                        player.x,
                        player.z - height - 2
                    );
                }
            }

            if (this.canvas) {
                return this.canvas.toBuffer("image/png");
            }

        } else if (this.type == "text") {
            let rows = [];
            for (var iMesh in meshes) {
                const mesh = meshes[iMesh];
                for (var iRow in mesh.rows) {
                    const row = mesh.rows[iRow];
                    if (!rows.find((element) => element.y === row.y)) {
                        rows.push({ y: row.y, row: '' });
                    }
                    var row2 = rows.find((element) => element.y === row.y);
                    row2.row += row.row;
                }
            }
            rows = rows.sort((a, b) => a.x - b.x);
            this.finaltext = rows.map((element) => element.row).join('\n');
            return this.finaltext;
        }

        return null;
    }
}

class Camera {
    constructor(position, renderDistance) {
        this.position = position;
        this.speed = 100;
        this.renderDistance = renderDistance;
    }

    move(dx, dz) {
        this.position.x += dx * this.speed;
        this.position.z += dz * this.speed;
    }
}

class Application {
    constructor(client, renderType, camera, noiseGenerator, loadDistance, chunksize, snowLevel, PixelType) {
        this.camera = camera;
        this.run = this.run.bind(this);
        this.loadDistance = loadDistance;
        this.chunkManager = new ChunkManager(noiseGenerator, chunksize, snowLevel, PixelType);
        let canvas = null;
        let context = null;
        if (renderType == "canvas") {
            canvas = createCanvas(100, 100);
            context = canvas.getContext("2d");
        }
        this.renderer = new Renderer(renderType, chunksize, canvas, context, PixelType);
        this.pixeltype = PixelType;
        this.client = client;
        this.playersCache = [];
        this.pointsCache = [];

        this.players = async () => {
            let users = await this.client.usersdb.find();
            let players = [];
            for (let user of users) {
                if (user.rpg && user.rpg.position && user.rpg.position.x && user.rpg.position.z) {
                    let dUser = await this.client.users.fetch(user.id);
                    players.push({
                        x: user.rpg.position.x,
                        z: user.rpg.position.z,
                        name: dUser.username
                    });
                }
            }
            this.playersCache = players;
            return players;
        }

        this.points = async () => {
            let points = await this.client.mappointsdb.find();
            this.pointsCache = points;
            return points;
        }
    }

    save() {
        var chunks = this.chunkManager.get();
        var seed = this.chunkManager.terrainGenerator.noiseGenerator.getSeed();
        var data = {
            chunks: chunks,
            seed: seed,
        };
        return data;
    }

    getPixelType(id) {
        return this.pixeltype.find((element) => element.id == id);
    }

    load(data) {
        this.chunkManager.load(data.chunks);
        if (data.seed) this.chunkManager.terrainGenerator.noiseGenerator.setSeed(data.seed);
    }

    run() {
        this.chunkManager.loadChunks(this.loadDistance, this.camera);
    }

    async runRender() {
        let result = this.renderer.draw(this.camera, this.chunkManager, await this.points(), await this.players());
        return result;
    }

    getRandomCoords() {
        let pixelAndChunk;
        let x;
        let z;
        while (!pixelAndChunk || !pixelAndChunk?.pixel || pixelAndChunk?.pixel?.type != 1) {
            let minmax = this.chunkManager.getMinMaxCoords();
            x = Math.floor(Math.random() * (minmax.maxx - minmax.minx + 1) + minmax.minx);
            z = Math.floor(Math.random() * (minmax.maxz - minmax.minz + 1) + minmax.minz);

            pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(x, z);
        }

        return { x: x, z: z };
    }

    async getPlayerPosition(id) {
        let user = await this.client.usersdb.findOne({ id: id });
        if (!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;
        let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(user.rpg.position.x, user.rpg.position.z);
        if (!pixelAndChunk) return false;
        return pixelAndChunk;
    }

    async spawn(id) {
        let position = await this.getPlayerPosition(id);
        if (position) return false;

        let coords = this.getRandomCoords();
        try {
            await this.client.usersdb.bulkWrite([
                this.client.bulkutility.setField({
                    'id': id
                }, {
                    'rpg.position.x': coords.x,
                    'rpg.position.z': coords.z
                })
            ])
        } catch (err) { console.log(err); }
        return coords;
    }

    async travel(id, x, z, updatefunction, finishcallback) {
        if (!updatefunction) updatefunction = async () => { };

        let user = await this.client.usersdb.findOne({ id: id });
        if (!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;

        console.log('[TRAVEL] Récupération du chemin');
        let path = await this.gps(user, x, z);
        if (!path) return false;
        console.log('[TRAVEL] Le chemin a été récupéré');

        let timeouts = [];
        for (let pixel of path) {
            let timeout = 0;
            let pixeltype = this.getPixelType(pixel.pixel.type);
            if (pixeltype) timeout = pixeltype.time;
            timeouts.push(timeout);
        }

        let timeout = 0;
        for (let i = 0; i < path.length; i++) { timeout += timeouts[i]; }

        let timestamp = Date.now();
        let finished = false;

        let interval = setInterval(async () => {
            let remaining = timeout - (Date.now() - timestamp);
            if (remaining <= 0) {
                console.log('[TRAVEL] Travel finished');
                finished = true;

                try {
                    await this.client.usersdb.bulkWrite([
                        this.client.bulkutility.setField({
                            'id': id
                        }, {
                            'rpg.position.x': x,
                            'rpg.position.z': z
                        })
                    ])
                } catch (err) { }

                clearInterval(interval);
                if (finishcallback) {
                    let dataReturn = path[path.length - 1];
                    let pixel = this.chunkManager.getCoordPixelAndChunk(x, z)?.pixel?.type;
                    dataReturn.type = this.getPixelType(pixel);
                    dataReturn.eated = 2;
                    dataReturn.watered = 1;

                    dataReturn.eated = dataReturn.eated * path.length;
                    dataReturn.watered = dataReturn.watered * path.length;

                    try {
                        let actualwater = user.rpg.water;
                        let actualfood = user.rpg.food;
                        actualfood = actualfood - dataReturn.eated;
                        actualwater = actualwater - dataReturn.watered;
                        if (actualfood < 0) actualfood = 0;
                        if (actualwater < 0) actualwater = 0;
                        await this.client.usersdb.bulkWrite([
                            this.client.bulkutility.setField({
                                'id': id
                            }, {
                                'rpg.food': actualfood,
                                'rpg.water': actualwater
                            })
                        ])
                    } catch (err) { }

                    await finishcallback(dataReturn);
                    this.players();
                }
            }
        }, 1000);

        while (!finished) {
            let timeoutdone = Date.now() - timestamp;
            let timeout2 = 0;
            for (let i = 0; i < timeouts.length; i++) {
                let timeout1 = timeouts[i];
                timeout2 += timeout1;
                if (timeoutdone < timeout2) {
                    if (timeoutdone == timeout) break;
                    await updatefunction(path[i], Math.floor((timeoutdone / timeout) * 100));
                    break;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        return true;
    }

    async gps(user, x, z, bypass = false) {
        console.log(`[GPS] Vérification de l'existence de l'utilisateur ${user.id}`);
        if (!user || !user?.rpg || !user?.rpg?.position || !user?.rpg?.position?.x || !user?.rpg?.position?.z) return false;
        console.log(`[GPS] L'utilisateur ${user.id} existe`);

        let minmax = this.chunkManager.getMinMaxCoords();

        console.log(`[GPS] Vérification de la validité des coords`);
        if (x < minmax.minx || x > minmax.maxx || z < minmax.minz || z > minmax.maxz) return false;
        console.log(`[GPS] Les coords sont valides`);

        if (user.rpg.position.x < minmax.minx || user.rpg.position.x > minmax.maxx || user.rpg.position.z < minmax.minz || user.rpg.position.z > minmax.maxz) return false;
        console.log(`[GPS] Les coords de l'utilisateur sont valides`);

        let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(x, z);
        if (!pixelAndChunk) return false;
        console.log(`[GPS] Le chunk et le pixel existent`);
        if (pixelAndChunk.pixel.type == 2 && !bypass) return false;
        console.log(`[GPS] Le pixel n'est pas de l'eau ou bien on a le baetau bypass`);

        let userPixelAndChunk = this.chunkManager.getCoordPixelAndChunk(user.rpg.position.x, user.rpg.position.z);
        if (!userPixelAndChunk) return false;
        console.log(`[GPS] Le chunk et le pixel de l'utilisateur existent`);

        console.log(`[GPS] Récupération du chemin (simple)`);
        let linepath = this.getLinePath(user.rpg.position.x, user.rpg.position.z, x, z);
        if (!linepath) return false;
        console.log(`[GPS] Le chemin a été récupéré`);

        let water = false;
        for (let pixel of linepath) {
            if (pixel.pixel.type == 2) {
                water = true;
                console.log(`[GPS] Il y a de l'eau`);
                break;
            }
        }

        if (!water) {
            console.log(`[GPS] Le GPS est terminé sans bateau`);
            return linepath;
        }

        if (bypass) {
            console.log(`[GPS] Avec le bypass, on peut prendre un bateau donc le chemin en ligne droite est possible`);
            return linepath;
        }

        console.log(`[GPS] Création du pathfinder`);
        var finder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        });
        console.log(`[GPS] Le pathfinder a été créé`);

        console.log(`[GPS] Récupération de la matrice`);
        let matrix = this.getMatrix(minmax);

        console.log(`[GPS] Vérification des différentes coordonnées début et fin dans la matrice`);
        if (user.rpg.position.x - minmax.minx < 0 || user.rpg.position.x - minmax.minx > matrix.length) { console.log(`[GPS] La coordonnée x de l'utilisateur n'est pas dans la matrice : ${user.rpg.position.x - minmax.minx} > ${matrix.length}`); return false; }
        if (user.rpg.position.z - minmax.minz < 0 || user.rpg.position.z - minmax.minz > matrix[0].length) { console.log(`[GPS] La coordonnée z de l'utilisateur n'est pas dans la matrice : ${user.rpg.position.z - minmax.minz} > ${matrix[0].length}`); return false; }
        if (x - minmax.minx < 0 || x - minmax.minx > matrix.length) { console.log(`[GPS] La coordonnée x de la destination n'est pas dans la matrice : ${x - minmax.minx} > ${matrix.length}`); return false; }
        if (z - minmax.minz < 0 || z - minmax.minz > matrix[0].length) { console.log(`[GPS] La coordonnée z de la destination n'est pas dans la matrice : ${z - minmax.minz} > ${matrix[0].length}`); return false; }
        console.log(`[GPS] Les différentes coordonnées début et fin sont dans la matrice`);

        var grid = new PF.Grid(matrix);

        console.log(`[GPS] Récupération du path`);
        try {
            var path = finder.findPath(
                user.rpg.position.x - minmax.minx, user.rpg.position.z - minmax.minz,
                x - minmax.minx, z - minmax.minz,
                grid
            );
        } catch (err) { console.log(`[GPS] Catastrophe, le pathfinder a crashé : ${err.stack}`); return false; }
        console.log(`[GPS] Le path a été récupéré`);

        if (!path || path.length == 0) {
            console.log(`[GPS] Aucun chemin n'a été trouvé`);
            return false;
        }

        console.log(`[GPS] Transformation des coords`);
        let finalpath = [];
        for (let coords of path) {
            finalpath.push({
                x: coords[0] + minmax.minx,
                z: coords[1] + minmax.minz
            });
        }

        console.log(`[GPS] Lissage du chemin A* avec Raycast`);
        let linepathWithAStar = [finalpath[0]];
        for (let i = 1; i < finalpath.length; i++) {
            let lastPoint = linepathWithAStar[linepathWithAStar.length - 1];
            let currentPoint = finalpath[i];

            let possibleLine = this.getLinePath(lastPoint.x, lastPoint.z, currentPoint.x, currentPoint.z);
            let obstacle = false;
            for (let p of possibleLine) {
                if (p.pixel.type == 2) {
                    obstacle = true;
                    break;
                }
            }
            if (obstacle) {
                linepathWithAStar.push(finalpath[i - 1]);
            }
        }
        linepathWithAStar.push(finalpath[finalpath.length - 1]);
        finalpath = linepathWithAStar;

        console.log(`[GPS] Récupération du chemin (complexe)`);
        let finalLinePath = [];
        for (let i = 0; i < finalpath.length; i++) {
            if (i + 1 >= finalpath.length) break;

            let coords1 = finalpath[i];
            let coords2 = finalpath[i + 1];

            let linepath = this.getLinePath(coords1.x, coords1.z, coords2.x, coords2.z);
            if (!linepath) return false;

            for (let pixel of linepath) { finalLinePath.push(pixel); }
        }

        let uniquePath = [];
        let seenPath = new Set();
        for (let p of finalLinePath) {
            let key = `${p.x},${p.z}`;
            if (!seenPath.has(key)) {
                seenPath.add(key);
                uniquePath.push(p);
            }
        }
        finalLinePath = uniquePath;

        console.log(`[GPS] Le chemin a été récupéré`);

        console.log(`[GPS] Le GPS est terminé avec succès en contournant l'eau`);
        return finalLinePath;
    }

    getMatrix(minmax) {
        let width = minmax.maxx - minmax.minx + 1;
        let height = minmax.maxz - minmax.minz + 1;
        let matrix = new Array(width);
        for (let i = 0; i < width; i++) {
            matrix[i] = new Array(height).fill(0);
        }

        let startChunkX = Math.floor(minmax.minx / this.chunkManager.chunksize) * this.chunkManager.chunksize;
        let startChunkZ = Math.floor(minmax.minz / this.chunkManager.chunksize) * this.chunkManager.chunksize;
        let endChunkX = Math.floor(minmax.maxx / this.chunkManager.chunksize) * this.chunkManager.chunksize;
        let endChunkZ = Math.floor(minmax.maxz / this.chunkManager.chunksize) * this.chunkManager.chunksize;

        for (let cx = startChunkX; cx <= endChunkX; cx += this.chunkManager.chunksize) {
            for (let cz = startChunkZ; cz <= endChunkZ; cz += this.chunkManager.chunksize) {
                let chunk = this.chunkManager.getChunkAt(cx, cz);
                if (!chunk) continue;

                let startX = Math.max(minmax.minx, cx);
                let endX = Math.min(minmax.maxx, cx + this.chunkManager.chunksize - 1);
                let startZ = Math.max(minmax.minz, cz);
                let endZ = Math.min(minmax.maxz, cz + this.chunkManager.chunksize - 1);

                for (let x = startX; x <= endX; x++) {
                    let matrixX = x - minmax.minx;
                    let px = x - cx;
                    for (let z = startZ; z <= endZ; z++) {
                        let matrixZ = z - minmax.minz;
                        let pz = z - cz;
                        let pixel = chunk.pixels[pz * this.chunkManager.chunksize + px];
                        if (pixel && pixel.type == 2) {
                            matrix[matrixX][matrixZ] = 1;
                        }
                    }
                }
            }
        }
        return matrix;
    }

    getLinePath(x1, z1, x2, z2) {
        let points = [];
        let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
        let numberofpoints = Math.floor(distance);
        if (numberofpoints === 0) numberofpoints = 1;

        let xstep = (x2 - x1) / numberofpoints;
        let zstep = (z2 - z1) / numberofpoints;
        let x = x1;
        let z = z1;
        for (let i = 0; i < numberofpoints; i++) {
            let pixelAndChunk = this.chunkManager.getCoordPixelAndChunk(Math.round(x), Math.round(z));
            if (!pixelAndChunk) return false;
            points.push({
                x: Math.round(x),
                z: Math.round(z),
                chunk: pixelAndChunk.chunk,
                pixel: pixelAndChunk.pixel
            });
            x += xstep;
            z += zstep;
        }

        // Ensure destination point is included
        let destPixelAndChunk = this.chunkManager.getCoordPixelAndChunk(Math.round(x2), Math.round(z2));
        if (destPixelAndChunk) {
            points.push({
                x: Math.round(x2),
                z: Math.round(z2),
                chunk: destPixelAndChunk.chunk,
                pixel: destPixelAndChunk.pixel
            });
        }

        let uniquePoints = [];
        let seen = new Set();
        for (let p of points) {
            let key = `${p.x},${p.z}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniquePoints.push(p);
            }
        }
        points = uniquePoints;
        return points;
    }
}

module.exports = {
    Application, Camera, NoiseGenerator
};
