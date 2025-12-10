import Template from '../models/template.js';
import { MESSAGES, TEMPLATE_CATEGORIES } from '../utils/constants.js';

/**
 * Template Controller
 */
class TemplateController {
    /**
     * Get all templates
     */
    static async getAllTemplates(req, res) {
        try {
            const { category, page = 1, limit = 10 } = req.query;
            const query = category ? { category } : {};
            
            const templates = await Template.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
            
            const total = await Template.countDocuments(query);
            
            res.json({
                success: true,
                data: templates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Get template by ID
     */
    static async getTemplateById(req, res) {
        try {
            const template = await Template.findById(req.params.id);
            
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                data: template
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Create new template
     */
    static async createTemplate(req, res) {
        try {
            const template = new Template(req.body);
            await template.save();
            
            res.status(201).json({
                success: true,
                message: 'Template créé avec succès',
                data: template
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Update template
     */
    static async updateTemplate(req, res) {
        try {
            const template = await Template.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: 'Template mis à jour avec succès',
                data: template
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Delete template
     */
    static async deleteTemplate(req, res) {
        try {
            const template = await Template.findByIdAndDelete(req.params.id);
            
            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: 'Template supprimé avec succès'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Get active templates
     */
    static async getActiveTemplates(req, res) {
        try {
            const templates = await Template.find({ isActive: true })
                .sort({ createdAt: -1 });
            
            res.json({
                success: true,
                data: templates
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }
}

export default TemplateController;
