/**
 * Configuration centralisée des URLs de l'API
 */
export const API_CONFIG = {
  // URL de base du backend
  BASE_URL: 'http://localhost:5000',
  
  // Endpoints de l'API
  ENDPOINTS: {
    PROJECTS: '/api/projects',
    USERS: '/api/users',
    AUTH: '/api/auth'
  },
  
  // Chemins des ressources statiques
  STATIC_PATHS: {
    IMAGES: '/uploads/images',
    DOCUMENTS: '/uploads/documents'
  }
};

// Helper pour construire les URLs complètes
export class ApiUrlBuilder {
  /**
   * Construit l'URL complète pour un endpoint
   */
  static endpoint(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }
  
  /**
   * Construit l'URL complète pour une image
   */
  static imageUrl(imageName?: string): string {
    if (!imageName) return '';
    if (imageName.startsWith('data:')) return imageName;
    if (imageName.startsWith('http')) return imageName;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.STATIC_PATHS.IMAGES}/${imageName}`;
  }
  
  /**
   * URL de base pour les projets
   */
  static get projects() {
    return this.endpoint(API_CONFIG.ENDPOINTS.PROJECTS);
  }
}
