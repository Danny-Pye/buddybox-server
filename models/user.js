import mongoose from "mongoose";
const {Schema} = mongoose;

const userSchema = new Schema({
    name: {
        type: "string",
        trim: true,
        required: true,
    },
    email: {
        type: "string",
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: "string",
        required: true,
        min: 6,
        max: 255,
    },
    secret: {
        type: "string",
        trim: true,
        required: true,
    },
    username: {
        type: "string",
        unique: true,
        required: true,
    },
    about: {},
    image: {
        url: String,
        public_id: String,
    },
    following: [{type: Schema.ObjectId, ref: "User"}],
    followers: [{type: Schema.ObjectId, ref: "User"}],

}, {timestamps: true});

export default mongoose.model("User", userSchema);