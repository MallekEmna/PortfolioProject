import express from 'express';
import { createProjectValidation, updateProjectValidation, validate } from '../validators/projectValidator.js';
import ProjectController from '../controllers/projectController.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all user projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 */
router.get('/', ProjectController.getUserProjects);

/**
 * @swagger
 * /api/projects/status/{status}:
 *   get:
 *     summary: Get projects by status
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Active, Complete, Pending]
 *         description: Project status
 *     responses:
 *       200:
 *         description: Projects filtered by status
 */
router.get('/status/:status', ProjectController.getProjectsByStatus);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/:id', ProjectController.getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - duration
 *               - category
 *               - title
 *               - description
 *             properties:
 *               companyName:
 *                 type: string
 *               duration:
 *                 type: string
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               linkDemo:
 *                 type: string
 *               linkGithub:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createProjectValidation, validate, ProjectController.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               duration:
 *                 type: string
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               linkDemo:
 *                 type: string
 *               linkGithub:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Active, Complete, Pending]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put('/:id', updateProjectValidation, validate, ProjectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/:id', ProjectController.deleteProject);

/**
 * @swagger
 * /api/projects/upload/{id}:
 *   put:
 *     summary: Upload project image
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               projectImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Project image uploaded successfully
 *       404:
 *         description: Project not found
 */
router.put('/upload/:id', uploadSingle('projectImage'), ProjectController.uploadProjectImage);

/**
 * @swagger
 * /api/projects/create-with-image:
 *   post:
 *     summary: Create project with image
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - duration
 *               - category
 *               - title
 *               - description
 *             properties:
 *               companyName:
 *                 type: string
 *               duration:
 *                 type: string
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: string
 *               linkDemo:
 *                 type: string
 *               linkGithub:
 *                 type: string
 *               status:
 *                 type: string
 *               projectImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Project created with image successfully
 */
router.post('/create-with-image', uploadSingle('projectImage'), ProjectController.createProjectWithImage);

export default router;
