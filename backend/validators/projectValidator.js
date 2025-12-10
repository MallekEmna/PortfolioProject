import { body, validationResult } from 'express-validator';
import { PROJECT_STATUS, MESSAGES } from '../utils/constants.js';

/**
 * Validation middleware for projects
 */

// Create project validation rules
const createProjectValidation = [
    body('companyName')
        .trim()
        .notEmpty()
        .withMessage('Le nom de l\'entreprise est requis')
        .isLength({ max: 100 })
        .withMessage('Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
    
    body('duration')
        .trim()
        .notEmpty()
        .withMessage('La durée est requise')
        .isLength({ max: 50 })
        .withMessage('La durée ne peut pas dépasser 50 caractères'),
    
    body('category')
        .trim()
        .notEmpty()
        .withMessage('La catégorie est requise')
        .isLength({ max: 50 })
        .withMessage('La catégorie ne peut pas dépasser 50 caractères'),
    
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Le titre est requis')
        .isLength({ min: 3, max: 200 })
        .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('La description est requise')
        .isLength({ min: 10, max: 2000 })
        .withMessage('La description doit contenir entre 10 et 2000 caractères'),
    
    body('techStack')
        .isArray()
        .withMessage('La tech stack doit être un tableau'),
    
    body('techStack.*')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Chaque technologie doit contenir entre 2 et 50 caractères'),
    
    body('linkDemo')
        .optional()
        .trim()
        .isURL()
        .withMessage('Le lien demo doit être une URL valide'),
    
    body('linkGithub')
        .optional()
        .trim()
        .isURL()
        .withMessage('Le lien GitHub doit être une URL valide'),
    
    body('status')
        .optional()
        .isIn(Object.values(PROJECT_STATUS))
        .withMessage('Le statut doit être: ' + Object.values(PROJECT_STATUS).join(', '))
];

// Update project validation rules
const updateProjectValidation = [
    body('companyName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Le nom de l\'entreprise doit contenir entre 1 et 100 caractères'),
    
    body('duration')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('La durée doit contenir entre 1 et 50 caractères'),
    
    body('category')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('La catégorie doit contenir entre 1 et 50 caractères'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('La description doit contenir entre 10 et 2000 caractères'),
    
    body('techStack')
        .optional()
        .isArray()
        .withMessage('La tech stack doit être un tableau'),
    
    body('techStack.*')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Chaque technologie doit contenir entre 2 et 50 caractères'),
    
    body('linkDemo')
        .optional()
        .trim()
        .isURL()
        .withMessage('Le lien demo doit être une URL valide'),
    
    body('linkGithub')
        .optional()
        .trim()
        .isURL()
        .withMessage('Le lien GitHub doit être une URL valide'),
    
    body('status')
        .optional()
        .isIn(Object.values(PROJECT_STATUS))
        .withMessage('Le statut doit être: ' + Object.values(PROJECT_STATUS).join(', '))
];

// Validation result middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({
            success: false,
            message: MESSAGES.VALIDATION_ERROR,
            errors: errorMessages
        });
    }
    
    next();
};

export {
    createProjectValidation,
    updateProjectValidation,
    validate
};
