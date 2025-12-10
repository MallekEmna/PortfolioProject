import mongoose from "mongoose";
import Counter from "./counter.js";
import SocialLinks from "./socialLinks.js";

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    cvUploaded: { type: String, default: "" },
    cvAutomatic: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    lastName: { type: String, default: "" },
    templateSelected: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
    socialLinks: { type: mongoose.Schema.Types.ObjectId, ref: "SocialLinks" }
}, { timestamps: true });

// Index for userId to improve query performance
userSchema.index({ userId: 1 });

// Auto-increment userId middleware
userSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { idName: "userId" },
                { $inc: { seq: 1 } },
                { new: true, upsert: true, session: null }
            );
            
            if (!counter) {
                throw new Error("Failed to generate userId");
            }
            
            this.userId = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

const User = mongoose.model("User", userSchema);

export default User;