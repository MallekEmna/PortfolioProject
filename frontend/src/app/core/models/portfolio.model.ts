// core/models/portfolio.model.ts
export interface Portfolio {
    _id?: string;
    userId: string;
    templateId: string;
    htmlContent: string;
    publicUrl: string;
    title?: string;
    description?: string;
    isPublished?: boolean;
    status?: 'draft' | 'published' | 'archived';
    projects?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}