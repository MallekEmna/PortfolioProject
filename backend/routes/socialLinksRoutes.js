import express from 'express';
import SocialLinksController from '../controllers/socialLinksController.js';

const router = express.Router();

/**
 * @swagger
 * /api/social-links:
 *   get:
 *     summary: Get user social links
 *     tags: [Social Links]
 *     responses:
 *       200:
 *         description: Social links retrieved successfully
 */
router.get('/', SocialLinksController.getUserSocialLinks);

/**
 * @swagger
 * /api/social-links:
 *   post:
 *     summary: Create or update social links
 *     tags: [Social Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               github:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Social links created/updated successfully
 */
router.post('/', SocialLinksController.upsertSocialLinks);

/**
 * @swagger
 * /api/social-links:
 *   put:
 *     summary: Update social links
 *     tags: [Social Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               github:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *               website:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Social links updated successfully
 */
router.put('/', SocialLinksController.updateSocialLinks);

/**
 * @swagger
 * /api/social-links:
 *   delete:
 *     summary: Delete social links
 *     tags: [Social Links]
 *     responses:
 *       200:
 *         description: Social links deleted successfully
 */
router.delete('/', SocialLinksController.deleteSocialLinks);

export default router;
