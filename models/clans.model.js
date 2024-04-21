// here is a modele for omegabot clans
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clanSchema = new Schema({
    members: {
        type: Array,
        required: true,
        default: [],
        ref: "User"
    },
    invites: {
        type: Array,
        required: true,
        default: [],
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: "Pas de description."
    },
    logo: {
        type: String,
    },
    banner: {
        type: String,
    },
    xp: {
        type: Number,
        required: true,
        default: 0
    },
    money: {
        type: Number,
        required: true,
        default: 0
    },
});

clanSchema.statics.createModel = async function (object) {
	const clan = new clan({
        members: object.members,
        name: object.name,
        description: object.description
    });
	return await clan.save();
}

clanSchema.statics.ping = async function () {
	let time = Date.now();
	await clan.findOne({ id: "1" });
	return Date.now() - time;
}

const clan = mongoose.model('Clan', clanSchema);

module.exports = clan;