import { body, validationResult } from 'express-validator';
import { MESSAGES } from '../utils/constants.js';

/**
 * Validation middleware for authentication
 */

// Register validation rules
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Le username doit contenir entre 3 et 30 caractères')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Le username ne peut contenir que des lettres, chiffres et underscores'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[+]?[\d\s\-()]+$/)
        .withMessage('Format de téléphone invalide'),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('La localisation ne peut pas dépasser 100 caractères'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La bio ne peut pas dépasser 500 caractères'),
    
    body('skills')
        .optional()
        .isArray()
        .withMessage('Les skills doivent être un tableau'),
    
    body('skills.*')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Chaque skill doit contenir entre 2 et 50 caractères')
];

// Login validation rules
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Le mot de passe est requis')
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
    registerValidation,
    loginValidation,
    validate
};
