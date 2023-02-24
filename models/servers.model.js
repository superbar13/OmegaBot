// here is a modele for omegabot servers
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    radio: {
        name: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        website: {
            type: String,
            required: false
        },
        logo: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        language: {
            type: String,
            required: false
        },
        votes: {
            type: Number,
            required: false
        },
        genres: {
            type: String,
            required: false
        },
        id: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },  
    },
    music: {
        title: {
            type: String,
            required: false
        },
        artist: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        thumbnail: {
            type: String,
            required: false
        },
        duration: {
            type: Number,
            required: false
        },
        requester: {
            type: String,
            required: false
        }
    },
    voiceconfig: {
        guildId: {
            type: String,
            required: false
        },
        channelId : {
            type: String,
            required: false
        },
        volume: {
            type: Number,
            required: false
        },
        adminonly: {
            type: Boolean,
            default: false
        },
        playing: {
            type: Boolean,
            default: false
        },
        type: {
            // radio or music
            type: String,
            default: "none"
        },
    }
});

serverSchema.statics.createModel = async function (object) {
    const server = new Server({
        id: object.id,
    });
    return await server.save();
}

serverSchema.statics.ping = async function () {
    let time = Date.now();
    await Server.findOne({ id: "1" });
    return Date.now() - time;    
}

const Server = mongoose.model('server', serverSchema);

module.exports = Server;