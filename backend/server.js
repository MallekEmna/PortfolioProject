import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// ========== CONFIGURATION HELMET POUR AUTORISER LES IMAGES ==========
app.use(helmet({
    // DÉSACTIVER les politiques qui bloquent les images
    crossOriginResourcePolicy: false, // ← TRÈS IMPORTANT !
    crossOriginEmbedderPolicy: false, // ← IMPORTANT aussi
    
    // Configurer CSP pour autoriser les images
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "http://localhost:4200", "http://localhost:5000"],
            "media-src": ["'self'", "data:", "blob:", "http://localhost:4200", "http://localhost:5000"],
        },
    },
}));

app.use(compression());
app.use(morgan('combined'));

// ========== CORS CONFIGURATION COMPLÈTE ==========
app.use(cors({
    origin: ['http://localhost:4200', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Range'],
    exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Range']
}));

// Middleware pour headers CORS explicites
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Headers CORS pour toutes les réponses
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Range');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin'); // ← CRITIQUE
    res.header('Cross-Origin-Embedder-Policy', 'require-corp'); // ← Modifié
    
    // Préflight requests
    if (req.method === 'OPTIONS') {
        console.log('Preflight request handled');
        return res.status(200).end();
    }
    
    next();
});

// ========== ROUTE DÉDIÉE POUR LES IMAGES DANS /UPLOADS/IMAGES ==========
app.get('/uploads/images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const cleanFilename = filename.split('?')[0]; // Enlever query params
        const filePath = path.join(__dirname, 'uploads', 'images', cleanFilename);
        
        console.log('=== IMAGE FROM /UPLOADS/IMAGES/ REQUEST ===');
        console.log('Filename:', cleanFilename);
        console.log('Full path:', filePath);
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            return res.status(404).json({ error: 'Image not found', path: filePath });
        }
        
        // Headers spécifiques pour les images
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        res.header('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
        
        // Déterminer le Content-Type
        const ext = path.extname(cleanFilename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.header('Content-Type', contentType);
        
        console.log('✅ Serving image from /uploads/images/ with headers:', {
            contentType,
            'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
            'Cross-Origin-Resource-Policy': res.getHeader('Cross-Origin-Resource-Policy')
        });
        
        // Envoyer le fichier
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error serving image' });
                }
            } else {
                console.log('✅ File sent successfully from /uploads/images/');
            }
        });
        
    } catch (error) {
        console.error('❌ Route error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// ========== ROUTE DÉDIÉE POUR LES IMAGES ==========
app.get('/uploads/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const cleanFilename = filename.split('?')[0]; // Enlever query params
        const filePath = path.join(__dirname, 'uploads', cleanFilename);
        
        console.log('=== IMAGE REQUEST ===');
        console.log('Filename:', cleanFilename);
        console.log('Full path:', filePath);
        
        // Vérifier si le fichier existe
        if (!fs.existsSync(filePath)) {
            console.log('❌ File not found:', filePath);
            return res.status(404).json({ error: 'Image not found', path: filePath });
        }
        
        // Headers spécifiques pour les images
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        res.header('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
        
        // Déterminer le Content-Type
        const ext = path.extname(cleanFilename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.header('Content-Type', contentType);
        
        console.log('✅ Serving image with headers:', {
            contentType,
            'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
            'Cross-Origin-Resource-Policy': res.getHeader('Cross-Origin-Resource-Policy')
        });
        
        // Envoyer le fichier
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('❌ Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error serving image' });
                }
            } else {
                console.log('✅ File sent successfully');
            }
        });
        
    } catch (error) {
        console.error('❌ Route error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// ========== FICHIERS STATIQUES (fallback) ==========
app.use('/static', express.static('uploads', {
    setHeaders: (res, path) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
import connectDB from './config/db.js';
connectDB();

// Routes
import userRoutes from './routes/user.js';
import projectRoutes from './routes/projectRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import socialLinksRoutes from './routes/socialLinksRoutes.js';
import { specs, swaggerUi } from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/social-links', socialLinksRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Test route
app.get("/", (req, res) => {
    res.json({ 
        message: "Portfolio API Running...",
        version: "1.0.0",
        endpoints: {
            users: "/api/users", 
            projects: "/api/projects",
            templates: "/api/templates",
            portfolios: "/api/portfolios",
            socialLinks: "/api/social-links",
            images: "/uploads/:filename"
        },
        testImage: "http://localhost:5000/uploads/679d83d64a3d0d545f7e99c3.JPG"
    });
});

// Error handler middleware
app.use(errorHandler);

// Create uploads directories
const createUploadDirs = () => {
    const dirs = ['uploads/images', 'uploads/documents'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
createUploadDirs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📷 Image test URL: http://localhost:${PORT}/uploads/679d83d64a3d0d545f7e99c3.JPG`);
    console.log(`🌐 Frontend URL: http://localhost:4200`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});