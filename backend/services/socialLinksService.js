import SocialLinks from '../models/socialLinks.js';

/**
 * Social Links Service
 */
class SocialLinksService {
    /**
     * Create social links
     * @param {object} socialLinksData - Social links data
     * @returns {Promise<object>} Created social links
     */
    static async createSocialLinks(socialLinksData) {
        const socialLinks = new SocialLinks(socialLinksData);
        return await socialLinks.save();
    }

    /**
     * Get social links by user ID
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} Social links document
     */
    static async getSocialLinksByUserId(userId) {
        return await SocialLinks.findOne({ userId });
    }

    /**
     * Update social links
     * @param {string} userId - User ID
     * @param {object} updateData - Update data
     * @returns {Promise<object>} Updated social links
     */
    static async updateSocialLinks(userId, updateData) {
        return await SocialLinks.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Create or update social links (upsert)
     * @param {string} userId - User ID
     * @param {object} socialLinksData - Social links data
     * @returns {Promise<object>} Created or updated social links
     */
    static async upsertSocialLinks(userId, socialLinksData) {
        return await SocialLinks.findOneAndUpdate(
            { userId },
            { ...socialLinksData, userId },
            { new: true, upsert: true, runValidators: true }
        );
    }

    /**
     * Delete social links
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Deletion success
     */
    static async deleteSocialLinks(userId) {
        const result = await SocialLinks.findOneAndDelete({ userId });
        return !!result;
    }

    /**
     * Validate social links URLs
     * @param {object} socialLinks - Social links object
     * @returns {object} Validation result
     */
    static validateSocialLinks(socialLinks) {
        const errors = [];
        const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        
        // Validate LinkedIn
        if (socialLinks.linkedin && !urlRegex.test(socialLinks.linkedin)) {
            errors.push('URL LinkedIn invalide');
        }
        
        // Validate GitHub
        if (socialLinks.github && !urlRegex.test(socialLinks.github)) {
            errors.push('URL GitHub invalide');
        }
        
        // Validate Facebook
        if (socialLinks.facebook && !urlRegex.test(socialLinks.facebook)) {
            errors.push('URL Facebook invalide');
        }
        
        // Validate Instagram
        if (socialLinks.instagram && !urlRegex.test(socialLinks.instagram)) {
            errors.push('URL Instagram invalide');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get social links statistics
     * @returns {Promise<object>} Social links statistics
     */
    static async getSocialLinksStatistics() {
        const stats = await SocialLinks.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    linkedinUsers: { $sum: { $cond: [{ $ne: ['$linkedin', ''] }, 1, 0] } },
                    githubUsers: { $sum: { $cond: [{ $ne: ['$github', ''] }, 1, 0] } },
                    facebookUsers: { $sum: { $cond: [{ $ne: ['$facebook', ''] }, 1, 0] } },
                    instagramUsers: { $sum: { $cond: [{ $ne: ['$instagram', ''] }, 1, 0] } }
                }
            }
        ]);
        
        return stats[0] || {
            totalUsers: 0,
            linkedinUsers: 0,
            githubUsers: 0,
            facebookUsers: 0,
            instagramUsers: 0
        };
    }
}

export default SocialLinksService;
