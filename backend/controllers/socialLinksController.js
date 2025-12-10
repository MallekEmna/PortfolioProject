import SocialLinks from '../models/socialLinks.js';
import { MESSAGES } from '../utils/constants.js';

const DEFAULT_USER_ID = '693453e12a3b85f45f4499d3';

/**
 * Social Links Controller
 */
class SocialLinksController {
    /**
     * Get user social links
     */
static async getUserSocialLinks(req, res) {
    try {
        console.log('=== Getting social links ===');
        const socialLinks = await SocialLinks.findOne({ userId: DEFAULT_USER_ID });
        
        let result = {
            linkedin: "",
            github: "",
            facebook: "",
            instagram: "",
            twitter: ""
        };
        
        if (socialLinks) {
            console.log('Social links found:', socialLinks.toObject());
            // Extraire les champs du document MongoDB
            result = {
                linkedin: socialLinks.linkedin || "",
                github: socialLinks.github || "",
                facebook: socialLinks.facebook || "",
                instagram: socialLinks.instagram || "",
                twitter: socialLinks.twitter || ""
            };
        } else {
            console.log('No social links found, creating default');
            // Créer un document par défaut
            const defaultSocialLinks = new SocialLinks({
                userId: DEFAULT_USER_ID,
                ...result
            });
            await defaultSocialLinks.save();
            console.log('Default social links created');
        }
        
        console.log('Returning:', result);
        res.json(result);  // Retourner un objet simple
        
    } catch (error) {
        console.error('Error getting social links:', error);
        res.status(500).json({
            message: MESSAGES.SERVER_ERROR,
            error: error.message
        });
    }
}

    /**
     * Create or update social links
     */
    static async upsertSocialLinks(req, res) {
        try {
            console.log('=== Upserting social links ==='); // Debug log
            console.log('Request body:', req.body); // Debug log
            
            const socialLinks = await SocialLinks.findOneAndUpdate(
                { userId: DEFAULT_USER_ID },
                { ...req.body, userId: DEFAULT_USER_ID },
                { new: true, upsert: true, runValidators: true }
            );
            
            console.log('Social links upserted:', socialLinks); // Debug log
            res.json(socialLinks);
        } catch (error) {
            console.error('Error upserting social links:', error); // Debug log
            res.status(400).json({
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }

    /**
     * Update social links
     */
    static async updateSocialLinks(req, res) {
        try {
            const socialLinks = await SocialLinks.findOneAndUpdate(
                { userId: DEFAULT_USER_ID },
                req.body,
                { new: true, runValidators: true }
            );
            
            if (!socialLinks) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: 'Social links mis à jour avec succès',
                data: socialLinks
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
     * Delete social links
     */
    static async deleteSocialLinks(req, res) {
        try {
            const socialLinks = await SocialLinks.findOneAndDelete({ userId: DEFAULT_USER_ID });
            
            if (!socialLinks) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: 'Social links supprimés avec succès'
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

export default SocialLinksController;
