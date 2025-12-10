import multer from 'multer';
import path from 'path';
import { UPLOAD_LIMITS } from '../utils/constants.js';

/**
 * File upload configuration
 */

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, 'uploads/images/');
        } else {
            cb(null, 'uploads/documents/');
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else if (UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé'), false);
    }
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE,
        files: 5 // Maximum 5 files per request
    }
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const singleUpload = upload.single(fieldName);
        
        singleUpload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur lors de l\'upload',
                    error: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            next();
        });
    };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        const multipleUpload = upload.array(fieldName, maxCount);
        
        multipleUpload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur lors de l\'upload',
                    error: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            next();
        });
    };
};

// Profile image upload
const uploadProfileImage = uploadSingle('profileImage');

// CV upload
const uploadCV = uploadSingle('cv');

// Project images upload
const uploadProjectImages = uploadMultiple('images', 3);

export {
    uploadProfileImage,
    uploadCV,
    uploadProjectImages,
    uploadSingle,
    upload
};
