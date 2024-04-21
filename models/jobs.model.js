// here is a modele for omegabot jobs
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    money:{
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        }
    },
    ultramoney:{
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        }
    },
    xp:{
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        }
    },
    xpNeeded:{
        type: Number,
        required: true,
    },
});

jobSchema.statics.createModel = async function (object) {
	const job = new job({
        name: object.name,
        description: object.description,
        money: {
            min: object.money.min,
            max: object.money.max,
        },
        ultramoney: {
            min: object.ultramoney.min,
            max: object.ultramoney.max,
        },
        xp: {
            min: object.xp.min,
            max: object.xp.max,
        },
        xpNeeded: object.xpNeeded,
    });
	return await job.save();
}

jobSchema.statics.ping = async function () {
	let time = Date.now();
	await job.findOne({ id: "1" });
	return Date.now() - time;
}

const job = mongoose.model('Job', jobSchema);

module.exports = job;