// here is a modele for omegabot map
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MapSchema = new Schema({
    pixels: [
        {
            type: {
                type: String,
                required: true
            },
            heightMap: {
                type: Number,
                required: true
            }
        }
    ],
    position: {
        x: {
            type: String,
            required: true,
        },
        z: {
            type: String,
            required: true,
        }
    },
});

// unique with index position
MapSchema.index({ position: 1 }, { unique: true });

MapSchema.statics.SaveMap = async function (object) {
    console.log("Saving map...");
    // get all chunks
    console.log("Fetching map... (for saving)");
    let chunks = await Map.find({});
    console.log("Map fetched. (for saving)");
    let i = 0;
    await Promise.all(object.chunks.map(async (chunk) => {
        // find the chunk with position x and y
        let dbChunk = chunks.find(c => c.position.x == chunk.position.x && c.position.z == chunk.position.z);
        if(!dbChunk) {
            // if it doesn't exist, create it
            let newChunk = new Map({
                pixels: chunk.pixels,
                position: {
                    x: chunk.position.x ? String(chunk.position.x) : "0",
                    z: chunk.position.z ? String(chunk.position.z) : "0"
                }
            });
            await newChunk.save();
        } else {
            // if it does exist, update it only if different
            if(JSON.stringify(dbChunk.pixels) != JSON.stringify(chunk.pixels)) {
                Map.updateOne({ position: { x: chunk.position.x, z: chunk.position.z } }, { pixels: chunk.pixels });
            }
        }
        i++;
        // remove last console.log and add a new one with the percent
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("Saving map... " + Math.round(i / object.chunks.length * 100) + "%");
    }));
    // sauter une ligne avec process.stdout.write("\n");
    process.stdout.write("\n");
    console.log("Map saved. Finished.");
}

MapSchema.statics.GetMap = async function () {
    console.log("Fetching map...");
    // get all chunks
    let chunks = await Map.find({});
    console.log("Map fetched (for getting).");
    // create a new object
    let object = {
        chunks: []
    };
    // for each chunk
    let i = 0;
    await Promise.all(chunks.map(async (chunk) => {
        // add it to the object
        object.chunks.push({
            position: {
                x: chunk.position.x,
                z: chunk.position.z
            },
            pixels: chunk.pixels
        });
        i++;
        // remove last console.log and add a new one with the percent
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("Fetching map... " + Math.round(i / chunks.length * 100) + "%");
    }));
    // sauter une ligne avec process.stdout.write("\n");
    process.stdout.write("\n");
    console.log("Map fetched. Finished.");
    // return the object
    return object;
}

MapSchema.statics.ping = async function () {
	let time = Date.now();
	await Interserver.findOne({ id: "1" });
	return Date.now() - time;
}

const Map = mongoose.model('map', MapSchema);

module.exports = Map;