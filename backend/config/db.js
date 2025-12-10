import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // options si nécessaire
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Mongo connection error', err);
        process.exit(1);
    }
};

export default connectDB;
