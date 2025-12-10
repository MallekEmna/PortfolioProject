import { NgModule } from '@angular/core';
import { LucideAngularModule, User, Mail, FileText, Upload, Settings, X, Linkedin, Facebook, Instagram, Edit } from 'lucide-angular';
import { Github } from 'lucide-angular/src/icons';

const icons = {
    User,
    Mail,
    FileText,
    Upload,
    Settings,
    X,
    Github,
    Linkedin,
    Facebook,
    Instagram,
    Edit
};

@NgModule({
    imports: [LucideAngularModule.pick(icons)],
    exports: [LucideAngularModule],
})
export class LucideIconsModule { }
