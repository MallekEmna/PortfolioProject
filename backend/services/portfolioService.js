import Portfolio from '../models/Portfolio.js';
import Template from '../models/template.js';
import { generateSlug } from '../utils/helpers.js';
import { PORTFOLIO_STATUS } from '../utils/constants.js';

/**
 * Portfolio service
 */
class PortfolioService {
    /**
     * Create or update portfolio for user
     * @param {object} portfolioData - Portfolio data
     * @returns {Promise<object>} Created or updated portfolio
     */
    static async createOrUpdatePortfolio(portfolioData) {
        const { userId } = portfolioData;
        
        // Check if portfolio already exists for this user
        const existingPortfolio = await Portfolio.findOne({ userId })
            .sort({ createdAt: -1 }); // Get the most recent one
        
        if (existingPortfolio) {
            // Update existing portfolio
            const updateData = {
                ...portfolioData,
                status: existingPortfolio.status || PORTFOLIO_STATUS.DRAFT,
                isPublished: existingPortfolio.isPublished || false
            };
            
            // Keep existing publicUrl if it exists, otherwise generate new one
            if (!existingPortfolio.publicUrl) {
                updateData.publicUrl = generateSlug(portfolioData.title || 'portfolio') + '-' + Date.now();
            }
            
            const updated = await Portfolio.findByIdAndUpdate(
                existingPortfolio._id,
                updateData,
                { new: true, runValidators: true }
            );
            
            return await Portfolio.findById(updated._id)
                .populate('userId')
                .populate('templateId')
                .populate('projects');
        } else {
            // Create new portfolio
            const publicUrl = generateSlug(portfolioData.title || 'portfolio') + '-' + Date.now();
            
            const portfolio = new Portfolio({
                ...portfolioData,
                publicUrl,
                status: PORTFOLIO_STATUS.DRAFT,
                isPublished: false
            });
            
            const saved = await portfolio.save();
            return await Portfolio.findById(saved._id)
                .populate('userId')
                .populate('templateId')
                .populate('projects');
        }
    }

    /**
     * Create new portfolio (legacy method for backward compatibility)
     * @param {object} portfolioData - Portfolio data
     * @returns {Promise<object>} Created portfolio
     */
    static async createPortfolio(portfolioData) {
        return this.createOrUpdatePortfolio(portfolioData);
    }

    /**
     * Get portfolio by ID
     * @param {string} portfolioId - Portfolio ID
     * @returns {Promise<object|null>} Portfolio document
     */
    static async getPortfolioById(portfolioId) {
        const portfolio = await Portfolio.findById(portfolioId)
            .populate('userId', 'username email profileImage')
            .populate('templateId')
            .populate('projects', 'title status image');
        
        console.log('Portfolio found:', portfolio ? 'Yes' : 'No');
        if (portfolio) {
            console.log('Portfolio userId:', portfolio.userId);
            console.log('Portfolio userId type:', typeof portfolio.userId);
            console.log('Portfolio userId._id:', portfolio.userId?._id);
        }
        
        return portfolio;
    }

    /**
     * Get portfolio by public URL
     * @param {string} publicUrl - Public URL
     * @returns {Promise<object|null>} Portfolio document
     */
    static async getPortfolioByPublicUrl(publicUrl) {
        return await Portfolio.findOne({ 
            publicUrl, 
            status: PORTFOLIO_STATUS.PUBLISHED,
            isPublished: true
        })
            .populate('userId', 'username email profileImage')
            .populate('templateId')
            .populate('projects', 'title status image');
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
            .populate('templateId', 'name category preview')
            .populate('projects', 'title status image')
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
            .populate('userId', 'username email profileImage')
            .populate('templateId')
            .populate('projects', 'title status image');
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
            .populate('userId', 'username email profileImage')
            .populate('templateId')
            .populate('projects', 'title status image');
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
            status: PORTFOLIO_STATUS.PUBLISHED,
            isPublished: true
        })
            .populate('userId', 'username profileImage')
            .populate('templateId', 'name preview category')
            .populate('projects', 'title status image')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
    }
}

export default PortfolioService;
