import Template from '../models/template.js';
import { TEMPLATE_CATEGORIES } from '../utils/constants.js';

/**
 * Template Service
 */
class TemplateService {
    /**
     * Create new template
     * @param {object} templateData - Template data
     * @returns {Promise<object>} Created template
     */
    static async createTemplate(templateData) {
        const template = new Template(templateData);
        return await template.save();
    }

    /**
     * Get template by ID
     * @param {string} templateId - Template ID
     * @returns {Promise<object|null>} Template document
     */
    static async getTemplateById(templateId) {
        return await Template.findById(templateId);
    }

    /**
     * Get all templates
     * @param {object} options - Query options
     * @returns {Promise<Array>} Array of templates
     */
    static async getAllTemplates(options = {}) {
        const { category, page = 1, limit = 10, isActive } = options;
        const query = {};
        
        if (category) {
            query.category = category;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive;
        }
        
        return await Template.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
    }

    /**
     * Update template
     * @param {string} templateId - Template ID
     * @param {object} updateData - Update data
     * @returns {Promise<object>} Updated template
     */
    static async updateTemplate(templateId, updateData) {
        return await Template.findByIdAndUpdate(
            templateId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete template
     * @param {string} templateId - Template ID
     * @returns {Promise<boolean>} Deletion success
     */
    static async deleteTemplate(templateId) {
        const result = await Template.findByIdAndDelete(templateId);
        return !!result;
    }

    /**
     * Get active templates
     * @returns {Promise<Array>} Array of active templates
     */
    static async getActiveTemplates() {
        return await Template.find({ isActive: true })
            .sort({ createdAt: -1 });
    }

    /**
     * Get templates by category
     * @param {string} category - Template category
     * @returns {Promise<Array>} Array of templates
     */
    static async getTemplatesByCategory(category) {
        if (!Object.values(TEMPLATE_CATEGORIES).includes(category)) {
            throw new Error('Catégorie invalide');
        }
        
        return await Template.find({ 
            category, 
            isActive: true 
        }).sort({ createdAt: -1 });
    }

    /**
     * Count templates by category
     * @returns {Promise<object>} Template counts by category
     */
    static async countTemplatesByCategory() {
        const counts = await Template.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        return counts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
    }

    /**
     * Search templates
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching templates
     */
    static async searchTemplates(searchTerm) {
        return await Template.find({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { description: { $regex: searchTerm, $options: 'i' } },
                        { category: { $regex: searchTerm, $options: 'i' } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });
    }
}

export default TemplateService;
