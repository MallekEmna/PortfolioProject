import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema({
    linkedin: {
        type: String,
        default: ""
    },
    github: {
        type: String,
        default: ""
    },
    facebook: {
        type: String,
        default: ""
    },
    instagram: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const SocialLinks = mongoose.model("SocialLinks", socialLinksSchema);

export default SocialLinks;
