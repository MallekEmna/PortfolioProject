export interface Project {
    _id?: string;
    userId?: string;
    companyName: string;
    duration: string;
    category: string;
    title: string;
    description: string;
    techStack: string[];
    image?: string;
    linkDemo?: string;
    linkGithub?: string;
    status?: 'Active' | 'Complete' | 'Pending';
}