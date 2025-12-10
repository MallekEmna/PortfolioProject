import Portfolio from '../models/Portfolio.js';
import { MESSAGES } from '../utils/constants.js';

const DEFAULT_USER_ID = '693453e12a3b85f45f4499d3';

/**
 * Get all portfolios for the default user
 */
export const getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: DEFAULT_USER_ID })
      .populate('templateId', 'name category')
      .populate('projects', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Get single portfolio by ID
 */
export const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id)
      .populate('templateId', 'name category')
      .populate('projects', 'title status');

    if (!portfolio || portfolio.userId.toString() !== DEFAULT_USER_ID) {
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
      message: MESSAGES.SERVER_ERROR
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

    const portfolio = await Portfolio.create(portfolioData);

    res.status(201).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Update portfolio
 */
export const updatePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.userId.toString() !== DEFAULT_USER_ID) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedPortfolio
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Delete portfolio
 */
export const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.userId.toString() !== DEFAULT_USER_ID) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    await portfolio.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Publish portfolio
 */
export const publishPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio || portfolio.userId.toString() !== DEFAULT_USER_ID) {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND
      });
    }

    portfolio.isPublished = true;
    await portfolio.save();

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('Error publishing portfolio:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Get user's main portfolio
 */
export const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: DEFAULT_USER_ID })
      .populate('templateId', 'name category')
      .populate('projects', 'title status');

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
      message: MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Get all published portfolios
 */
export const getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ isPublished: true })
      .populate('templateId', 'name category')
      .populate('projects', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching published portfolios:', error);
    res.status(500).json({
      success: false,
      message: MESSAGES.SERVER_ERROR
    });
  }
};