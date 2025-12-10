// core/models/template.model.ts
export interface Template {
    _id?: string;
    name: string;
    colors: string[];
    layout: {
        sections: string[];
        theme: string;
    };
    preview?: string;
}