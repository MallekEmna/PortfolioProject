import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    idName: { type: String, required: true }, // le nom du compteur (ex: "userId")
    seq: { type: Number, default: 0 }
});

export default mongoose.model("Counter", CounterSchema);
