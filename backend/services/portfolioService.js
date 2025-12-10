import Portfolio from '../models/Portfolio.js';
import Template from '../models/template.js';
import { generateSlug } from '../utils/helpers.js';
import { PORTFOLIO_STATUS } from '../utils/constants.js';

/**
 * Portfolio service
 */
class PortfolioService {
    /**
     * Create new portfolio
     * @param {object} portfolioData - Portfolio data
     * @returns {Promise<object>} Created portfolio
     */
    static async createPortfolio(portfolioData) {
        // Generate unique public URL
        const publicUrl = generateSlug(portfolioData.title || 'portfolio') + '-' + Date.now();
        
        const portfolio = new Portfolio({
            ...portfolioData,
            publicUrl,
            status: PORTFOLIO_STATUS.DRAFT
        });
        
        return await portfolio.save()
            .populate('userId')
            .populate('templateId');
    }

    /**
     * Get portfolio by ID
     * @param {string} portfolioId - Portfolio ID
     * @returns {Promise<object|null>} Portfolio document
     */
    static async getPortfolioById(portfolioId) {
        return await Portfolio.findById(portfolioId)
            .populate('userId', 'username email profileImage')
            .populate('templateId');
    }

    /**
     * Get portfolio by public URL
     * @param {string} publicUrl - Public URL
     * @returns {Promise<object|null>} Portfolio document
     */
    static async getPortfolioByPublicUrl(publicUrl) {
        return await Portfolio.findOne({ 
            publicUrl, 
            status: PORTFOLIO_STATUS.PUBLISHED 
        })
            .populate('userId', 'username email profileImage')
            .populate('templateId');
    }

    /**
     * Get user portfolios
     * @param {string} userId - User ID
     * @param {object} options - Query options
     * @returns {Promise<Array>} Array of portfolios
     */
    static async getUserPortfolios(userId, options = {}) {
        const { page = 1, limit = 10, status } = options;
        const query = { userId };
        
        if (status) {
            query.status = status;
        }
        
        return await Portfolio.find(query)
            .populate('templateId')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
    }

    /**
     * Update portfolio
     * @param {string} portfolioId - Portfolio ID
     * @param {object} updateData - Update data
     * @returns {Promise<object>} Updated portfolio
     */
    static async updatePortfolio(portfolioId, updateData) {
        return await Portfolio.findByIdAndUpdate(
            portfolioId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('userId templateId');
    }

    /**
     * Publish portfolio
     * @param {string} portfolioId - Portfolio ID
     * @returns {Promise<object>} Published portfolio
     */
    static async publishPortfolio(portfolioId) {
        return await Portfolio.findByIdAndUpdate(
            portfolioId,
            { 
                status: PORTFOLIO_STATUS.PUBLISHED,
                isPublished: true
            },
            { new: true }
        )
            .populate('userId templateId');
    }

    /**
     * Delete portfolio
     * @param {string} portfolioId - Portfolio ID
     * @returns {Promise<boolean>} Deletion success
     */
    static async deletePortfolio(portfolioId) {
        const result = await Portfolio.findByIdAndDelete(portfolioId);
        return !!result;
    }

    /**
     * Get all published portfolios
     * @param {object} options - Query options
     * @returns {Promise<Array>} Array of published portfolios
     */
    static async getPublishedPortfolios(options = {}) {
        const { page = 1, limit = 10 } = options;
        
        return await Portfolio.find({ 
            status: PORTFOLIO_STATUS.PUBLISHED 
        })
            .populate('userId', 'username profileImage')
            .populate('templateId', 'name preview')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
    }
}

export default PortfolioService;
