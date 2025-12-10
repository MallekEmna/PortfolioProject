import express from 'express';
import {
  getUserPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  publishPortfolio,
  getMyPortfolio,
  getPortfolios
} from '../controllers/portfolioController.js';

const router = express.Router();

/**
 * @swagger
 * /api/portfolios/my:
 *   get:
 *     summary: Get my portfolio
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: My portfolio retrieved successfully
 */
router.get('/my', getMyPortfolio);

/**
 * @swagger
 * /api/portfolios:
 *   get:
 *     summary: Get all portfolios
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: List of portfolios retrieved successfully
 */
router.get('/', getPortfolios);

/**
 * @swagger
 * /api/portfolios/user:
 *   get:
 *     summary: Get user portfolios
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: User portfolios retrieved successfully
 */
router.get('/user', getUserPortfolios);

/**
 * @swagger
 * /api/portfolios/{id}:
 *   get:
 *     summary: Get portfolio by ID
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *       404:
 *         description: Portfolio not found
 */
router.get('/:id', getPortfolioById);

/**
 * @swagger
 * /api/portfolios:
 *   post:
 *     summary: Create new portfolio
 *     tags: [Portfolios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               templateId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 */
router.post('/', createPortfolio);

/**
 * @swagger
 * /api/portfolios/{id}:
 *   put:
 *     summary: Update portfolio
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               templateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *       404:
 *         description: Portfolio not found
 */
router.put('/:id', updatePortfolio);

/**
 * @swagger
 * /api/portfolios/{id}:
 *   delete:
 *     summary: Delete portfolio
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
 *       404:
 *         description: Portfolio not found
 */
router.delete('/:id', deletePortfolio);

/**
 * @swagger
 * /api/portfolios/{id}/publish:
 *   put:
 *     summary: Publish portfolio
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Portfolio published successfully
 *       404:
 *         description: Portfolio not found
 */
router.put('/:id/publish', publishPortfolio);

export default router;
