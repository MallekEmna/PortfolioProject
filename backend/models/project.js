import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    techStack: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: ""
    },
    linkDemo: {
        type: String,
        default: ""
    },
    linkGithub: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['Active', 'Complete', 'Pending'],
        default: 'Active'
    }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;
