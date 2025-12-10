import express from 'express';
import TemplateController from '../controllers/templateController.js';

const router = express.Router();

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of templates retrieved successfully
 */
router.get('/', TemplateController.getAllTemplates);

/**
 * @swagger
 * /api/templates/active:
 *   get:
 *     summary: Get active templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Active templates retrieved successfully
 */
router.get('/active', TemplateController.getActiveTemplates);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get('/:id', TemplateController.getTemplateById);

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create new template (Admin only)
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Template created successfully
 */
router.post('/', TemplateController.createTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update template (Admin only)
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Template updated successfully
 *       404:
 *         description: Template not found
 */
router.put('/:id', TemplateController.updateTemplate);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete template (Admin only)
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
 *       404:
 *         description: Template not found
 */
router.delete('/:id', TemplateController.deleteTemplate);

export default router;
