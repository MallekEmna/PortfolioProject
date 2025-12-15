import { Injectable } from '@angular/core';
import { User } from '../core/models/user.model';
import { Template } from '../core/models/template.model';
import { Project } from '../core/models/project.model';

@Injectable({ providedIn: 'root' })
export class PortfolioGeneratorService {

    /**
     * Generate HTML content for portfolio based on template, user data and projects
     */
    generatePortfolioHTML(
        template: Template,
        user: User | null,
        projects: Project[] = []
    ): string {
        if (!user) {
            return this.generateEmptyPortfolio(template);
        }

        const primaryColor = template.colors?.[0] || '#4f46e5';
        const secondaryColor = template.colors?.[1] || '#7c3aed';
        const accentColor = template.colors?.[2] || '#ec4899';
        const neutralColor = template.colors?.[3] || '#f9fafb';

        const sections = template.layout?.sections || [];
        const theme = template.layout?.theme || 'light';
        const isDark = theme === 'dark';

        // Helper function to check if a section should be included
        const hasSection = (sectionName: string): boolean => {
            return sections.length === 0 || sections.includes(sectionName);
        };

        let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${user.username || 'Portfolio'} - ${template.name}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Reset & Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            scroll-behavior: smooth;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: ${isDark ? '#f3f4f6' : '#1f2937'};
            background: ${isDark ? '#111827' : '#ffffff'};
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.2;
        }
        
        /* Header Styles */
        .main-header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
            padding: 6rem 0;
            position: relative;
            overflow: hidden;
        }
        
        .main-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M500,50L505,60L510,55L515,65L520,58L525,68L530,62L535,70L540,65L545,72L550,67L555,73L560,69L565,74L570,70L575,75L580,72L585,76L590,73L595,77L600,74L605,77L610,75L615,78L620,76L625,78L630,76L635,78L640,77L645,78L650,77L655,78L660,78L665,78L670,78L675,78L680,78L685,78L690,78L695,78L700,78L705,78L710,78L715,78L720,78L725,78L730,78L735,78L740,78L745,78L750,78L755,78L760,78L765,78L770,78L775,78L780,78L785,78L790,78L795,78L800,78L805,78L810,78L815,78L820,78L825,78L830,78L835,78L840,78L845,78L850,78L855,78L860,78L865,78L870,78L875,78L880,78L885,78L890,78L895,78L900,78L905,78L910,78L915,78L920,78L925,78L930,78L935,78L940,78L945,78L950,78L955,78L960,78L965,78L970,78L975,78L980,78L985,78L990,78L995,78L1000,78L1000,100L0,100L0,78Z" fill="rgba(255,255,255,0.1)"/></svg>');
            background-size: 100% 100px;
            background-position: bottom;
        }
        
        .header-content {
            text-align: center;
            position: relative;
            z-index: 1;
        }
        
        .header-title {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(120deg, #ffffff 0%, rgba(255,255,255,0.9) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-subtitle {
            font-size: 1.5rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.5;
        }
        
        /* Profile Section */
        .profile-section {
            padding: 6rem 0;
            background: ${isDark ? '#1f2937' : '#ffffff'};
        }
        
        .profile-card {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3rem;
            align-items: start;
            background: ${isDark ? '#374151' : neutralColor};
            border-radius: 1.5rem;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
        
        @media (max-width: 768px) {
            .profile-card {
                grid-template-columns: 1fr;
                text-align: center;
            }
        }
        
        .profile-image-container {
            position: relative;
        }
        
        .profile-image {
            width: 200px;
            height: 200px;
            border-radius: 1rem;
            object-fit: cover;
            border: 5px solid ${primaryColor};
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            transition: transform 0.3s ease;
        }
        
        .profile-image:hover {
            transform: scale(1.02);
        }
        
        .profile-info {
            flex: 1;
        }
        
        .profile-name {
            font-size: 2.5rem;
            color: ${isDark ? '#ffffff' : primaryColor};
            margin-bottom: 0.5rem;
        }
        
        .profile-title {
            font-size: 1.25rem;
            color: ${isDark ? '#d1d5db' : '#6b7280'};
            margin-bottom: 1.5rem;
            font-weight: 500;
        }
        
        .profile-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: ${isDark ? '#d1d5db' : '#4b5563'};
        }
        
        .detail-item i {
            color: ${primaryColor};
            width: 20px;
        }
        
        /* Skills Section */
        .skills-section {
            padding: 6rem 0;
            background: ${isDark ? '#111827' : '#f9fafb'};
        }
        
        .section-title {
            font-size: 2.5rem;
            text-align: center;
            margin-bottom: 3rem;
            color: ${primaryColor};
            position: relative;
            display: inline-block;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor});
            border-radius: 2px;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }
        
        .skill-category {
            background: ${isDark ? '#1f2937' : '#ffffff'};
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            border: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .skill-category:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .skill-category-title {
            font-size: 1.25rem;
            color: ${isDark ? '#ffffff' : '#1f2937'};
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .skill-tag {
            background: ${primaryColor}15;
            color: ${primaryColor};
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid ${primaryColor}30;
            transition: all 0.3s ease;
        }
        
        .skill-tag:hover {
            background: ${primaryColor};
            color: white;
            transform: translateY(-2px);
        }
        
        /* Projects Section - Improved Design */
        .projects-section {
            padding: 6rem 0;
            background: ${isDark ? '#1f2937' : '#ffffff'};
        }
        
        .projects-container {
            margin-top: 3rem;
        }
        
        .project-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }
        
        .project-card {
            background: ${isDark ? '#374151' : '#ffffff'};
            border-radius: 1.25rem;
            overflow: hidden;
            box-shadow: 0 15px 40px rgba(0,0,0,0.08);
            border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'};
            transition: all 0.4s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .project-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 60px rgba(0,0,0,0.15);
            border-color: ${primaryColor}50;
        }
        
        .project-card[onclick] {
            cursor: pointer;
        }
        
        .project-image-container {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        
        .project-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
        }
        
        .project-card:hover .project-image {
            transform: scale(1.05);
        }
        
        .project-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
            display: flex;
            align-items: flex-end;
            padding: 1.5rem;
        }
        
        .project-status {
            background: ${primaryColor};
            color: white;
            padding: 0.375rem 0.875rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .project-content {
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .project-header {
            margin-bottom: 1rem;
        }
        
        .project-title {
            font-size: 1.5rem;
            color: ${isDark ? '#ffffff' : '#1f2937'};
            margin-bottom: 0.5rem;
            line-height: 1.3;
        }
        
        .project-company {
            color: ${isDark ? '#9ca3af' : '#6b7280'};
            font-size: 0.95rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .project-description {
            color: ${isDark ? '#d1d5db' : '#4b5563'};
            line-height: 1.6;
            margin-bottom: 1.5rem;
            flex: 1;
        }
        
        .project-tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .tech-badge {
            background: ${accentColor}15;
            color: ${accentColor};
            padding: 0.375rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid ${accentColor}30;
            transition: all 0.3s ease;
        }
        
        .tech-badge:hover {
            background: ${accentColor};
            color: white;
            transform: translateY(-1px);
        }
        
        .project-links {
            display: flex;
            gap: 0.75rem;
            margin-top: auto;
        }
        
        .project-link {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: 0.75rem;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .project-link.demo {
            background: ${primaryColor};
            color: white;
        }
        
        .project-link.demo:hover {
            background: ${secondaryColor};
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
        }
        
        .project-link.github {
            background: ${isDark ? '#4b5563' : '#f3f4f6'};
            color: ${isDark ? '#f3f4f6' : '#374151'};
            border: 1px solid ${isDark ? '#6b7280' : '#e5e7eb'};
        }
        
        .project-link.github:hover {
            background: ${isDark ? '#6b7280' : '#e5e7eb'};
            transform: translateY(-2px);
        }
        
        /* Contact Section */
        .contact-section {
            padding: 6rem 0;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
        }
        
        .contact-content {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .contact-title {
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(120deg, #ffffff 0%, rgba(255,255,255,0.9) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .contact-description {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 2.5rem;
            line-height: 1.6;
        }
        
        .contact-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .contact-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }
        
        .contact-item:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
        }
        
        .contact-item i {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: white;
            opacity: 0.9;
        }
        
        .contact-item h4 {
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }
        
        .contact-item p {
            opacity: 0.8;
            font-size: 0.95rem;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .social-link {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-decoration: none;
            font-size: 1.25rem;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .social-link:hover {
            background: white;
            color: ${primaryColor};
            transform: scale(1.1) translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        /* Footer */
        .main-footer {
            padding: 3rem 0;
            background: ${isDark ? '#111827' : '#f9fafb'};
            text-align: center;
            border-top: 1px solid ${isDark ? '#374151' : '#e5e7eb'};
        }
        
        .footer-text {
            color: ${isDark ? '#9ca3af' : '#6b7280'};
            font-size: 0.9rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 1.5rem;
            }
            
            .header-title {
                font-size: 2.5rem;
            }
            
            .header-subtitle {
                font-size: 1.25rem;
            }
            
            .profile-card {
                padding: 2rem;
            }
            
            .profile-name {
                font-size: 2rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .project-grid {
                grid-template-columns: 1fr;
            }
            
            .contact-title {
                font-size: 2rem;
            }
        }
        
        @media (max-width: 480px) {
            .header-title {
                font-size: 2rem;
            }
            
            .profile-name {
                font-size: 1.75rem;
            }
            
            .section-title {
                font-size: 1.75rem;
            }
            
            .project-links {
                flex-direction: column;
            }
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fadeInUp {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        /* Utility Classes */
        .text-gradient {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            border-radius: 0.75rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1rem;
        }
        
        .btn-primary {
            background: ${primaryColor};
            color: white;
        }
        
        .btn-primary:hover {
            background: ${secondaryColor};
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
        }
        
        .btn-outline {
            background: transparent;
            color: ${primaryColor};
            border: 2px solid ${primaryColor};
        }
        
        .btn-outline:hover {
            background: ${primaryColor};
            color: white;
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: ${isDark ? '#1f2937' : '#f1f1f1'};
        }
        
        ::-webkit-scrollbar-thumb {
            background: ${primaryColor};
            border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: ${secondaryColor};
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar" style="position: fixed; top: 0; width: 100%; z-index: 1000; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <div class="logo" style="font-size: 1.5rem; font-weight: 700; color: ${primaryColor};">${user.username || 'Portfolio'}</div>
            <div class="nav-links" style="display: flex; gap: 2rem;">
                ${hasSection('summary') || hasSection('about') ? `<a href="#profile" style="color: #4b5563; text-decoration: none; font-weight: 500; transition: color 0.3s;">Profil</a>` : ''}
                ${hasSection('skills') ? `<a href="#skills" style="color: #4b5563; text-decoration: none; font-weight: 500; transition: color 0.3s;">Compétences</a>` : ''}
                ${hasSection('projects') ? `<a href="#projects" style="color: #4b5563; text-decoration: none; font-weight: 500; transition: color 0.3s;">Projets</a>` : ''}
                ${hasSection('contact') ? `<a href="#contact" style="color: #4b5563; text-decoration: none; font-weight: 500; transition: color 0.3s;">Contact</a>` : ''}
            </div>
        </div>
    </nav>
`;

        // Header Section (summary)
        if (hasSection('summary')) {
            html += `
    <!-- Hero Section -->
    <header class="main-header" id="home">
        <div class="container">
            <div class="header-content">
                <h1 class="header-title animate-fadeInUp">${user.username || 'Portfolio'}</h1>
                <p class="header-subtitle animate-fadeInUp" style="animation-delay: 0.2s;">${user.bio || 'Développeur passionné créant des solutions innovantes'}</p>
                <div class="mt-8 animate-fadeInUp" style="animation-delay: 0.4s; margin-top: 2rem;">
                    ${hasSection('projects') ? `<a href="#projects" class="btn btn-primary" style="margin-right: 1rem;">
                        <i class="fas fa-rocket"></i> Voir mes projets
                    </a>` : ''}
                    ${hasSection('contact') ? `<a href="#contact" class="btn btn-outline">
                        <i class="fas fa-envelope"></i> Me contacter
                    </a>` : ''}
                </div>
            </div>
        </div>
    </header>
`;
        }

        // Profile Section (about)
        if (hasSection('about')) {
            html += `
    <!-- Profile Section -->
    <section class="profile-section" id="profile">
        <div class="container">
            <h2 class="section-title">À propos de moi</h2>
            <div class="profile-card animate-fadeInUp">
                <div class="profile-image-container">
                    <img src="${user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:5000/uploads/${user.profileImage}`) : 'https://i.pravatar.cc/300'}" 
                         alt="${user.username}" 
                         class="profile-image"
                         onerror="this.src='https://i.pravatar.cc/300'">
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${user.username || 'Utilisateur'}</h1>
                    <p class="profile-title">${user.bio || 'Développeur Full Stack'}</p>
                    <p style="color: ${isDark ? '#d1d5db' : '#4b5563'}; line-height: 1.6; margin-bottom: 1.5rem;">${user.bio || 'Passionné par la création de solutions numériques innovantes et performantes.'}</p>
                    <div class="profile-details">
                        ${user.email ? `
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <span>${user.email}</span>
                        </div>
                        ` : ''}
                        ${user.phone ? `
                        <div class="detail-item">
                            <i class="fas fa-phone"></i>
                            <span>${user.phone}</span>
                        </div>
                        ` : ''}
                        ${user.location ? `
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${user.location}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    </section>
`;
        }

        // Skills Section
        if (hasSection('skills') && user.skills && user.skills.length > 0) {
            html += `
    <!-- Skills Section -->
    <section class="skills-section" id="skills">
        <div class="container">
            <h2 class="section-title">Mes Compétences</h2>
            <div class="skills-grid">
`;

            // Group skills by category or type
            const skillsByCategory = this.groupSkillsByCategory(user.skills);

            Object.entries(skillsByCategory).forEach(([category, skills], index) => {
                const icons: { [key: string]: string } = {
                    'Frontend': 'fas fa-code',
                    'Backend': 'fas fa-server',
                    'Mobile': 'fas fa-mobile-alt',
                    'Database': 'fas fa-database',
                    'DevOps': 'fas fa-cloud',
                    'Tools': 'fas fa-tools',
                    'Design': 'fas fa-paint-brush',
                    'Languages': 'fas fa-globe'
                };

                const icon = icons[category] || 'fas fa-star';

                html += `
                <div class="skill-category animate-fadeInUp" style="animation-delay: ${index * 0.1}s;">
                    <h3 class="skill-category-title">
                        <i class="${icon}"></i> ${category}
                    </h3>
                    <div class="skill-tags">
                `;

                (skills as string[]).forEach(skill => {
                    html += `<span class="skill-tag">${skill}</span>`;
                });

                html += `
                    </div>
                </div>
                `;
            });

            html += `
            </div>
        </div>
    </section>
`;
        }

        // Projects Section
        if (hasSection('projects') && projects.length > 0) {
            html += `
    <!-- Projects Section -->
    <section class="projects-section" id="projects">
        <div class="container">
            <h2 class="section-title">Mes Projets</h2>
            <p class="text-center mb-8" style="text-align: center; margin-bottom: 2rem; color: ${isDark ? '#9ca3af' : '#6b7280'}; max-width: 600px; margin-left: auto; margin-right: auto;">
                Découvrez une sélection de mes projets les plus significatifs
            </p>
            <div class="projects-container">
                <div class="project-grid">
`;

            projects.forEach((project, index) => {
                const projectImageUrl = project.image
                    ? (project.image.startsWith('http') ? project.image : `http://localhost:5000/uploads/images/${project.image}`)
                    : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                const statusColors = {
                    'Active': '#10b981',
                    'Complete': '#3b82f6',
                    'Pending': '#f59e0b'
                };

                const statusTexts = {
                    'Active': 'En cours',
                    'Complete': 'Terminé',
                    'Pending': 'En attente'
                };

                const statusColor = statusColors[project.status || 'Complete'] || '#3b82f6';
                const statusText = statusTexts[project.status || 'Complete'] || 'Projet';

                html += `
                    <div class="project-card animate-fadeInUp" style="animation-delay: ${index * 0.1}s; cursor: pointer;" 
                         onclick="window.dispatchEvent(new CustomEvent('portfolio-project-click', { detail: { index: ${index} } }))">
                        <div class="project-image-container">
                            <img src="${projectImageUrl}" 
                                 alt="${project.title}" 
                                 class="project-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                            <div class="project-overlay">
                                <span class="project-status" style="background: ${statusColor}">${statusText}</span>
                            </div>
                        </div>
                        <div class="project-content">
                            <div class="project-header">
                                <h3 class="project-title">${project.title || 'Projet'}</h3>
                                ${project.companyName ? `
                                <div class="project-company">
                                    <i class="fas fa-building"></i> ${project.companyName}
                                </div>
                                ` : ''}
                            </div>
                            <p class="project-description">${project.description || 'Description du projet'}</p>
                `;

                // Tech Stack
                if (project.techStack && (Array.isArray(project.techStack) ? project.techStack.length > 0 : true)) {
                    html += `<div class="project-tech-stack">`;

                    const techArray = this.extractTechStack(project.techStack);
                    techArray.slice(0, 6).forEach(tech => {
                        html += `<span class="tech-badge">${tech}</span>`;
                    });

                    if (techArray.length > 6) {
                        html += `<span class="tech-badge">+${techArray.length - 6}</span>`;
                    }

                    html += `</div>`;
                }

                // Project Links
                html += `
                            <div class="project-links">
                `;

                if (project.linkDemo) {
                    html += `
                                <a href="${project.linkDemo}" target="_blank" class="project-link demo">
                                    <i class="fas fa-external-link-alt"></i> Voir le projet
                                </a>
                    `;
                }

                if (project.linkGithub) {
                    html += `
                                <a href="${project.linkGithub}" target="_blank" class="project-link github">
                                    <i class="fab fa-github"></i> Code source
                                </a>
                    `;
                }

                if (!project.linkDemo && !project.linkGithub) {
                    html += `
                                <span class="project-link demo" style="cursor: default; opacity: 0.7;">
                                    <i class="fas fa-lock"></i> Privé
                                </span>
                    `;
                }

                html += `
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            </div>
        </div>
    </section>
`;
        }

        // Contact Section
        if (hasSection('contact')) {
            html += `
    <!-- Contact Section -->
    <section class="contact-section" id="contact">
        <div class="container">
            <div class="contact-content">
                <h2 class="contact-title">Travaillons ensemble</h2>
                <p class="contact-description">
                    ${user.bio ? `"${user.bio}" - ` : ''}
                    N'hésitez pas à me contacter pour discuter de vos projets ou opportunités de collaboration.
                </p>
                <div class="contact-info-grid">
                    ${user.email ? `
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <h4>Email</h4>
                        <p>${user.email}</p>
                    </div>
                    ` : ''}
                    ${user.phone ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <h4>Téléphone</h4>
                        <p>${user.phone}</p>
                    </div>
                    ` : ''}
                    ${user.location ? `
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <h4>Localisation</h4>
                        <p>${user.location}</p>
                    </div>
                    ` : ''}
                </div>
                ${user.socialLinks ? `
                <div class="social-links">
                    ${user.socialLinks.linkedin ? `
                    <a href="${user.socialLinks.linkedin}" target="_blank" class="social-link">
                        <i class="fab fa-linkedin-in"></i>
                    </a>
                    ` : ''}
                    ${user.socialLinks.github ? `
                    <a href="${user.socialLinks.github}" target="_blank" class="social-link">
                        <i class="fab fa-github"></i>
                    </a>
                    ` : ''}
                    ${user.socialLinks.facebook ? `
                    <a href="${user.socialLinks.facebook}" target="_blank" class="social-link">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    ` : ''}
                    ${user.socialLinks.instagram ? `
                    <a href="${user.socialLinks.instagram}" target="_blank" class="social-link">
                        <i class="fab fa-instagram"></i>
                    </a>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        </div>
    </section>
`;
        }

        // Footer
        html += `
    <!-- Footer -->
    <footer class="main-footer">
        <div class="container">
            <p class="footer-text">
                &copy; ${new Date().getFullYear()} ${user.username || 'Portfolio'}. Tous droits réservés.
            </p>
            <p class="footer-text" style="margin-top: 0.5rem; font-size: 0.8rem;">
                Portfolio généré avec PortfolioBuilder
            </p>
        </div>
    </footer>
    
    <script>
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if(targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Add scroll animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        }, observerOptions);
        
        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    </script>
</body>
</html>`;

        return html;
    }

    /**
     * Group skills by category based on keywords
     */
    private groupSkillsByCategory(skills: string[]): { [key: string]: string[] } {
        const categories: { [key: string]: string[] } = {
            'Frontend': [],
            'Backend': [],
            'Mobile': [],
            'Database': [],
            'DevOps': [],
            'Tools': [],
            'Design': [],
            'Languages': []
        };

        const categoryKeywords = {
            'Frontend': ['react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css', 'sass', 'bootstrap', 'tailwind', 'next.js', 'nuxt.js'],
            'Backend': ['node.js', 'express', 'nestjs', 'spring', 'django', 'flask', 'laravel', 'php', 'python', 'java', 'c#', '.net', 'ruby', 'rails', 'go'],
            'Mobile': ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'xamarin', 'ionic'],
            'Database': ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'firebase', 'dynamodb'],
            'DevOps': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'nginx', 'apache'],
            'Tools': ['git', 'webpack', 'vite', 'docker', 'jenkins', 'jira', 'figma', 'adobe xd', 'photoshop'],
            'Design': ['figma', 'adobe xd', 'photoshop', 'illustrator', 'sketch', 'ui/ux', 'wireframing', 'prototyping'],
            'Languages': ['french', 'english', 'spanish', 'german', 'arabic']
        };

        skills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            let categorized = false;

            for (const [category, keywords] of Object.entries(categoryKeywords)) {
                if (keywords.some(keyword => skillLower.includes(keyword))) {
                    categories[category].push(skill);
                    categorized = true;
                    break;
                }
            }

            if (!categorized) {
                // Default to Frontend for programming languages, or Tools for others
                if (skillLower.includes('js') || skillLower.includes('script') || skillLower.includes('css') || skillLower.includes('html')) {
                    categories['Frontend'].push(skill);
                } else {
                    categories['Tools'].push(skill);
                }
            }
        });

        // Remove empty categories
        Object.keys(categories).forEach(category => {
            if (categories[category].length === 0) {
                delete categories[category];
            }
        });

        return categories;
    }

    /**
     * Extract tech stack from project
     */
    private extractTechStack(techStack: any): string[] {
        if (Array.isArray(techStack)) {
            return techStack;
        } else if (typeof techStack === 'string') {
            return techStack.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        }
        return [];
    }

    /**
     * Generate empty portfolio HTML when user data is not available
     */
    private generateEmptyPortfolio(template: Template): string {
        const primaryColor = template.colors?.[0] || '#4f46e5';
        const secondaryColor = template.colors?.[1] || '#7c3aed';

        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio - ${template.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        
        .empty-container {
            max-width: 500px;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .empty-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            opacity: 0.9;
        }
        
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(120deg, #ffffff 0%, rgba(255,255,255,0.8) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        p {
            font-size: 1.1rem;
            opacity: 0.9;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        
        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: white;
            color: ${primaryColor};
            text-decoration: none;
            border-radius: 0.75rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="empty-container">
        <div class="empty-icon">🚀</div>
        <h1>Portfolio en préparation</h1>
        <p>Votre portfolio est en cours de création. Veuillez compléter votre profil et ajouter vos projets pour générer un portfolio personnalisé.</p>
        <a href="/profile" class="cta-button">
            <i class="fas fa-user-edit"></i> Compléter mon profil
        </a>
    </div>
</body>
</html>`;
    }
}