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
	servers: [
		{
			id: String,
			channel: String,
			webhook: {
				id: String,
				token: String
			}
		}
	],
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
		default: "12345"
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
	gifs: {
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
		default: false
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
		servers: object.servers,
		owner: object.owner,
		//servers: object.servers,
		//moderators: object.moderators,
		description: object.description || "No description provided.",
		private: object.private || false,
		keycode: object.keycode || object.private ? "1234" : null,
		logo: object.logo || null,
		banner: object.banner || null,
		pictures: object.pictures || true,
		gifs: object.gifs || true,
		invites: object.invites || false,
		antispam: object.antispam || false,
		antilinks: object.antilinks || false,
		maxspamtime: object.maxspamtime || 5,
		antiswear: object.antiswear || false,
		maxspamcount: object.maxspamcount || 5,
		// bannedservers: object.bannedservers,
		bannedusers: object.bannedusers || [],
		bannedwords: object.bannedwords || [],
		bannedlinks: object.bannedlinks || []
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
