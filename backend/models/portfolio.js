import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
        required: true
    },
    htmlContent: {
        type: String,
        required: true
    },
    publicUrl: {
        type: String,
        required: true,
        unique: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "My Portfolio"
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
