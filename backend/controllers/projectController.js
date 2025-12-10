import Project from '../models/project.js';
import { MESSAGES, PROJECT_STATUS } from '../utils/constants.js';

const DEFAULT_USER_ID = '693453e12a3b85f45f4499d3';

class ProjectController {
    static async getUserProjects(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const query = { userId: DEFAULT_USER_ID };
            
            if (status) {
                query.status = status;
            }
            
            const projects = await Project.find(query)
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);
            
            const total = await Project.countDocuments(query);
            
            res.json({
                success: true,
                data: projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    static async getProjectById(req, res) {
        try {
            const project = await Project.findOne({
                _id: req.params.id,
                userId: DEFAULT_USER_ID
            });
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                data: project
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    static async createProject(req, res) {
        try {
            const projectData = {
                ...req.body,
                userId: DEFAULT_USER_ID
            };
            
            const project = new Project(projectData);
            await project.save();
            
            res.status(201).json({
                success: true,
                message: MESSAGES.PROJECT_CREATED,
                data: project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }

    static async updateProject(req, res) {
        try {
            const project = await Project.findOneAndUpdate(
                { _id: req.params.id, userId: DEFAULT_USER_ID },
                req.body,
                { new: true, runValidators: false }
            );
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: MESSAGES.PROJECT_UPDATED,
                data: project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }

    static async deleteProject(req, res) {
        try {
            const project = await Project.findOneAndDelete({ 
                _id: req.params.id, 
                userId: DEFAULT_USER_ID 
            });
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: MESSAGES.PROJECT_DELETED
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    static async getProjectsByStatus(req, res) {
        try {
            const { status } = req.params;
            
            if (!Object.values(PROJECT_STATUS).includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Statut invalide'
                });
            }
            
            const projects = await Project.find({
                userId: DEFAULT_USER_ID,
                status
            }).sort({ createdAt: -1 });
            
            res.json({
                success: true,
                data: projects
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    static async uploadProjectImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucune image fournie'
                });
            }

            const project = await Project.findOneAndUpdate(
                { _id: req.params.id, userId: DEFAULT_USER_ID },
                { image: req.file.filename },
                { new: true }
            );
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: MESSAGES.NOT_FOUND
                });
            }
            
            res.json({
                success: true,
                message: 'Image du projet uploadée avec succès',
                data: project
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: MESSAGES.SERVER_ERROR,
                error: error.message
            });
        }
    }

    static async createProjectWithImage(req, res) {
        try {
            const projectData = {
                ...req.body,
                userId: DEFAULT_USER_ID
            };

            // Ajouter le nom du fichier si une image a été uploadée
            if (req.file) {
                projectData.image = req.file.filename;
            }

            // Convertir techStack en array si c'est une string
            if (projectData.techStack && typeof projectData.techStack === 'string') {
                projectData.techStack = projectData.techStack.split(',').map(s => s.trim()).filter(Boolean);
            }
            
            const project = new Project(projectData);
            await project.save();
            
            res.status(201).json({
                success: true,
                message: MESSAGES.PROJECT_CREATED,
                data: project
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: MESSAGES.VALIDATION_ERROR,
                error: error.message
            });
        }
    }
}

export default ProjectController;
