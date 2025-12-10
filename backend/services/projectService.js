import Project from '../models/project.js';
import { PROJECT_STATUS } from '../utils/constants.js';

/**
 * Project Service
 */
class ProjectService {
    /**
     * Create new project
     * @param {object} projectData - Project data
     * @returns {Promise<object>} Created project
     */
    static async createProject(projectData) {
        const project = new Project(projectData);
        return await project.save();
    }

    /**
     * Get project by ID
     * @param {string} projectId - Project ID
     * @returns {Promise<object|null>} Project document
     */
    static async getProjectById(projectId) {
        return await Project.findById(projectId);
    }

    /**
     * Get user projects
     * @param {string} userId - User ID
     * @param {object} options - Query options
     * @returns {Promise<Array>} Array of projects
     */
    static async getUserProjects(userId, options = {}) {
        const { status, page = 1, limit = 10 } = options;
        const query = { userId };
        
        if (status) {
            query.status = status;
        }
        
        return await Project.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
    }

    /**
     * Update project
     * @param {string} projectId - Project ID
     * @param {object} updateData - Update data
     * @returns {Promise<object>} Updated project
     */
    static async updateProject(projectId, updateData) {
        return await Project.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Delete project
     * @param {string} projectId - Project ID
     * @returns {Promise<boolean>} Deletion success
     */
    static async deleteProject(projectId) {
        const result = await Project.findByIdAndDelete(projectId);
        return !!result;
    }

    /**
     * Get projects by status
     * @param {string} userId - User ID
     * @param {string} status - Project status
     * @returns {Promise<Array>} Array of projects
     */
    static async getProjectsByStatus(userId, status) {
        if (!Object.values(PROJECT_STATUS).includes(status)) {
            throw new Error('Statut invalide');
        }
        
        return await Project.find({ userId, status })
            .sort({ createdAt: -1 });
    }

    /**
     * Search projects
     * @param {string} userId - User ID
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Array of matching projects
     */
    static async searchProjects(userId, searchTerm) {
        return await Project.find({
            userId,
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { companyName: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { techStack: { $in: [new RegExp(searchTerm, 'i')] } }
            ]
        }).sort({ createdAt: -1 });
    }

    /**
     * Get project statistics
     * @param {string} userId - User ID
     * @returns {Promise<object>} Project statistics
     */
    static async getProjectStatistics(userId) {
        const stats = await Project.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const total = await Project.countDocuments({ userId });
        
        return {
            total,
            byStatus: stats.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        };
    }

    /**
     * Get recent projects
     * @param {string} userId - User ID
     * @param {number} limit - Number of projects to return
     * @returns {Promise<Array>} Array of recent projects
     */
    static async getRecentProjects(userId, limit = 5) {
        return await Project.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export default ProjectService;
