const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const HASH_ROUND = 10;

const UserSchema = new Schema({
    fullName: {
        required: true,
        type: String,
    },
    username: {
        required: true,
        type: String,
        unique: true,
    },
    email: {
        required: true,
        type: String,
        unique: true,
    },
    image: {
        type: String,
        default: null,
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    password: {
        required: true,
        type: String,
        unique: true,
    },
    deviceToken: {
        required: true,
        type: String,
    }
}, { timestamps: true });

UserSchema.path('email').validate(async function (value) {
    try {
        const count = await this.model('User').countDocuments({ email: value });
        console.log(count);
        return !count;
    } catch (error) {
        throw error;
    }
});

UserSchema.pre('save', function (next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
});

const userModel = model('User', UserSchema);
module.exports = userModel;