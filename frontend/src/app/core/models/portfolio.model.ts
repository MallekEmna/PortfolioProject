// core/models/portfolio.model.ts
export interface Portfolio {
    _id?: string;
    userId: string;
    templateId: string;
    htmlContent: string;
    publicUrl: string;
    createdAt?: Date;
}