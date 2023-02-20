// here is a modele for omegabot interservers
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interserverSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String,
        required: true,
        unique: true
    },
    servers: {
        type: Array,
        default: []
    },
    moderators: {
        type: Array,
        default: []
    },
    description: {
        type: String,
        default: "No description provided."
    },
    private: {
        type: Boolean,
        default: false
    },
    keycode: {
        type: String,
        default: "1234"
    },
    logo: {
        type: String,
    },
    banner: {
        type: String,
    },
    pictures: {
        type: Boolean,
        default: true
    },
    links: {
        type: Boolean,
        default: true
    },
    invites: {
        type: Boolean,
        default: true
    },
    antispam: {
        type: Boolean,
        default: true
    },
    antilinks: {
        type: Boolean,
        default: true
    },
    maxspamtime: {
        type: Number,
        default: 5
    },
    antiswear: {
        type: Boolean,
        default: true
    },
    maxspamcount: {
        type: Number,
        default: 5
    },
    bannedservers: {
        type: Array,
        default: []
    },
    bannedusers: {
        type: Array,
        default: []
    },
    bannedwords: {
        type: Array,
        default: []
    },
    bannedlinks: {
        type: Array,
        default: []
    },
});

interserverSchema.statics.createModel = async function (object) {
    const interserver = new Interserver({
        name: object.name,
        owner: object.owner
    });
    return await interserver.save();
}

interserverSchema.statics.ping = async function () {
    let time = Date.now();
    await Interserver.findOne({ id: "1" });
    return Date.now() - time;    
}

const Interserver = mongoose.model('interserver', interserverSchema);

module.exports = Interserver;
