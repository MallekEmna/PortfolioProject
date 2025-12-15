import express from 'express';
import { getUser, updateUser, upload, updateTemplateSelection } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/users/upload/{id}:
 *   put:
 *     summary: Upload user profile image
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       404:
 *         description: User not found
 */
router.put('/upload/:id', upload.single('profileImage'), async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const SocialLinks = (await import('../models/socialLinks.js')).default;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { profileImage: req.file.filename },
            { new: true }
        ).select("-password");

        // Récupérer les social links pour la réponse
        const socialLinks = await SocialLinks.findOne({ userId: req.params.id });
        console.log('Upload - Social links found:', socialLinks);

        // Retourner l'utilisateur avec ses social links
        const userWithSocialLinks = {
            ...updatedUser.toObject(),
            socialLinks: socialLinks || {
                linkedin: "",
                github: "",
                facebook: "",
                instagram: "",
                twitter: ""
            }
        };

        console.log('Upload - Response with social links:', userWithSocialLinks.socialLinks);
        res.json(userWithSocialLinks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

/**
 * @swagger
 * /api/users/{id}/template:
 *   put:
 *     summary: Update user template selection
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateSelected:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template selection updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id/template', updateTemplateSelection);

export default router;