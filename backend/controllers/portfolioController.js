import PortfolioService from '../services/portfolioService.js';
import Portfolio from '../models/Portfolio.js';
import { MESSAGES, DEFAULT_USER_ID, PAGINATION } from '../utils/constants.js';

/**
 * Helper function to extract user ID from portfolio
 * Handles both ObjectId and populated User object
 */
const getUserIdFromPortfolio = (portfolio) => {
  if (!portfolio || !portfolio.userId) return null;
  
  if (typeof portfolio.userId === 'object' && portfolio.userId._id) {
    // C'est un objet User après populate
    return portfolio.userId._id.toString();
  } else if (portfolio.userId.toString) {
    // C'est un ObjectId
    return portfolio.userId.toString();
  } else {
    return String(portfolio.userId);
  }
};

/**
 * Get all portfolios for the default user with pagination and filtering
 */
export const getUserPortfolios = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT),
      status
    };

    const portfolios = await PortfolioService.getUserPortfolios(DEFAULT_USER_ID, options);
    const total = await Portfolio.countDocuments({ userId: DEFAULT_USER_ID, ...(status && { status }) });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * Get single portfolio by ID
 */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await PortfolioService.getPortfolioById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    // Vérifier l'appartenance au DEFAULT_USER_ID
    const portfolioUserId = getUserIdFromPortfolio(portfolio);
    const defaultUserId = DEFAULT_USER_ID.toString();

    if (!portfolioUserId || portfolioUserId !== defaultUserId) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * Create portfolio
 */
export const createPortfolio = async (req, res) => {
  try {
    const portfolioData = {
      ...req.body,
      userId: DEFAULT_USER_ID
    };

    const portfolio = await PortfolioService.createPortfolio(portfolioData);

    res.status(201).json({
      success: true,
      message: MESSAGES.PORTFOLIO_CREATED,
      data: portfolio
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(400).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: error.message
    });
  }
};

/**
 * Update portfolio
 */
export const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await PortfolioService.getPortfolioById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const portfolioUserId = getUserIdFromPortfolio(portfolio);
    const defaultUserId = DEFAULT_USER_ID.toString();

    if (!portfolioUserId || portfolioUserId !== defaultUserId) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const updatedPortfolio = await PortfolioService.updatePortfolio(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: MESSAGES.PORTFOLIO_UPDATED,
      data: updatedPortfolio
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(400).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: error.message
    });
  }
};

/**
 * Delete portfolio
 */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await PortfolioService.getPortfolioById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const portfolioUserId = getUserIdFromPortfolio(portfolio);
    const defaultUserId = DEFAULT_USER_ID.toString();

    if (!portfolioUserId || portfolioUserId !== defaultUserId) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const deleted = await PortfolioService.deletePortfolio(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio supprimé avec succès',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * Publish portfolio
 */
export const publishPortfolio = async (req, res) => {
  try {
    const portfolio = await PortfolioService.getPortfolioById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const portfolioUserId = getUserIdFromPortfolio(portfolio);
    const defaultUserId = DEFAULT_USER_ID.toString();

    if (!portfolioUserId || portfolioUserId !== defaultUserId) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const publishedPortfolio = await PortfolioService.publishPortfolio(req.params.id);

    res.status(200).json({
      success: true,
      message: MESSAGES.PORTFOLIO_PUBLISHED,
      data: publishedPortfolio
    });
  } catch (error) {
    console.error('Error publishing portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * Get user's main portfolio
 */
export const getMyPortfolio = async (req, res) => {
  try {
    const portfolios = await PortfolioService.getUserPortfolios(DEFAULT_USER_ID, { limit: 1 });
    const portfolio = portfolios[0];

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error fetching my portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * Get all published portfolios
 */
export const getPortfolios = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), PAGINATION.MAX_LIMIT)
    };

    const portfolios = await PortfolioService.getPublishedPortfolios(options);
    const total = await Portfolio.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching published portfolios:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};