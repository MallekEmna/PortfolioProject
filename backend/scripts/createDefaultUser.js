import mongoose from 'mongoose';
import User from '../models/User.js';

const createDefaultUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
        
        // Check if default user already exists
        const existingUser = await User.findOne({ email: 'default@portfolio.com' });
        
        if (existingUser) {
            console.log('Default user already exists');
            process.exit(0);
        }
        
        // Create default user
        const defaultUser = new User({
            username: 'Default User',
            email: 'default@portfolio.com',
            password: 'default123', // In production, hash this password
            bio: 'Welcome to my portfolio!',
            skills: ['JavaScript', 'Node.js', 'Angular', 'MongoDB'],
            phone: '+1234567890',
            location: 'Paris, France',
            lastName: 'Portfolio'
        });
        
        await defaultUser.save();
        console.log('Default user created successfully');
        console.log('User ID:', defaultUser._id);
        console.log('Email: default@portfolio.com');
        console.log('Password: default123');
        
    } catch (error) {
        console.error('Error creating default user:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

createDefaultUser();
