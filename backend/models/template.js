import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    colors: {
        type: [String],
        required: true
    },
    layout: {
        sections: {
            type: [String],
            required: true
        },
        theme: {
            type: String,
            required: true
        }
    },
    preview: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        default: "general"
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Template = mongoose.model("Template", templateSchema);

export default Template;
