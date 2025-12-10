import { SocialLinks } from "./socialLinks.model";

export interface User {
    _id?: string;
    username: string;
    phone?: string;
    location?: string;
    lastName?: string;
    email: string;
    password?: string;
    bio?: string;
    profileImage?: string;
    skills: string[];
    cvUploaded?: string;
    cvAutomatic?: string;
    templateSelected?: string;
    socialLinks?: SocialLinks;
}