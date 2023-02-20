// here is a modele for omegabot users
// this is a mongoose model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    discriminator: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.statics.createModel = async function (object) {
    const user = new User({
        id: object.id,
        username: object.username,
        discriminator: object.discriminator
    });
    return await user.save();
}

userSchema.statics.ping = async function () {
    let time = Date.now();
    await User.findOne({ id: "1" });
    return Date.now() - time;    
}

const User = mongoose.model('user', userSchema);

module.exports = User;