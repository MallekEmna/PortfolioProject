/**
 * Application constants
 */

// User roles
const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// Project status
const PROJECT_STATUS = {
    ACTIVE: 'Active',
    COMPLETE: 'Complete',
    PENDING: 'Pending'
};

// Portfolio status
const PORTFOLIO_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
};

// Template categories
const TEMPLATE_CATEGORIES = {
    GENERAL: 'general',
    CREATIVE: 'creative',
    TECHNICAL: 'technical',
    BUSINESS: 'business'
};

// File upload limits
const UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// API messages
const MESSAGES = {
    USER_CREATED: 'Utilisateur créé avec succès',
    USER_UPDATED: 'Utilisateur mis à jour avec succès',
    USER_DELETED: 'Utilisateur supprimé avec succès',
    PROJECT_CREATED: 'Projet créé avec succès',
    PROJECT_UPDATED: 'Projet mis à jour avec succès',
    PROJECT_DELETED: 'Projet supprimé avec succès',
    PORTFOLIO_CREATED: 'Portfolio créé avec succès',
    PORTFOLIO_UPDATED: 'Portfolio mis à jour avec succès',
    PORTFOLIO_PUBLISHED: 'Portfolio publié avec succès',
    INVALID_CREDENTIALS: 'Identifiants invalides',
    ACCESS_DENIED: 'Accès refusé',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION_ERROR: 'Erreur de validation',
    SERVER_ERROR: 'Erreur serveur'
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Default user ID for single user mode
const DEFAULT_USER_ID = '693453e12a3b85f45f4499d3';

export {
    USER_ROLES,
    PROJECT_STATUS,
    PORTFOLIO_STATUS,
    TEMPLATE_CATEGORIES,
    UPLOAD_LIMITS,
    MESSAGES,
    PAGINATION,
    DEFAULT_USER_ID
};
