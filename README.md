## Frontend Angular – Portfolio CV

Application Angular (standalone components) pour gérer un profil, des projets, des templates de portfolio et l’upload de CV avec parsing via un backend FastAPI.

### Démarrer le serveur de dev

```bash
cd frontend
ng serve
```

Puis ouvrir `http://localhost:4200/`.

### Mapping avec le barème du projet Angular

- **Test des fonctionnalités implémentées (4 pts)**  
  - Écrans principaux :  
    - `profile` : gestion des infos perso, skills et réseaux sociaux (`Profile`, `PersonalInfoForm`, `SkillsSection`, `SocialMediaSection`).  
    - `projects` : CRUD projets + cartes et grille (`Projects`, `ProjectCard`, `AddProject`, `EditeProject`, `ProjectsGrid`, `ProjectsHeader`).  
    - `templates` : choix et édition de template de portfolio (`TemplatesPage`, `TemplateEditor`).  
    - `cv-upload` : upload de CV PDF, parsing (local / API externe / Ollama) et remplissage auto du formulaire (`CvUploadComponent`).  
    - `portfolio` : affichage du portfolio généré (timeline, cartes projets, sidebar fixe) (`PortfolioViewerComponent`).  
  - **Comment tester** : naviguer avec la sidebar (`ProfileSidebar`) ou directement via l’URL (`/profile`, `/projects`, `/templates`, `/cv-upload`, `/portfolio`), vérifier :  
    - Création / édition / suppression d’un projet.  
    - Modification des infos perso / skills / réseaux sociaux.  
    - Upload d’un PDF dans `CV Upload`, parsing et remplissage auto du formulaire puis sauvegarde vers le backend.  
    - Génération / régénération du portfolio après changement de template.

- **Clarté de code (2 pts)**  
  - Organisation en **features** (`features/profile`, `features/project`, `features/template`, `features/portfolio`, `features/cv-upload`) + **core/models** + **shared/pipes** + **services**.  
  - Utilisation de **services partagés** (`UserService`, `ProjectService`, `TemplateService`, `PortfolioService`, `CvParserService`, etc.) et de **signals/computed** pour l’état utilisateur et les projets.  
  - Nommage explicite des composants et méthodes (`addProject`, `loadProjects`, `regeneratePortfolio`, etc.).  
  - Pour l’oral, tu peux expliquer la séparation **composants de présentation** (ex. `ProjectCard`) vs **composants “containers”** (ex. `Projects`).

- **Design (Tailwind + choix de couleurs + IHM) (3 pts)**  
  - Tailwind activé dans `tailwind.config.js` (`darkMode: 'class'`) et utilisé dans les templates (`bg-white`, `rounded-xl`, `shadow-2xl`, `flex`, `grid`, `text-gray-700`, etc.).  
  - Exemples :  
    - `profile/profile.html` : layout avec sidebar fixe + contenu scrolable, cartes blanches avec ombre.  
    - `project-card.html` : carte projet avec image, badge de statut coloré, tags de techno, boutons “Demo” / “Github”.  
    - `portfolio-viewer.html` : timeline verticale, animations, sidebar cohérente avec le reste de l’app.  
  - Tu peux parler de l’accessibilité de base (contraste, boutons clairement visibles, textes lisibles) et du choix d’une palette bleu/gris moderne.

- **Directives et pipes (prédéfinies et personnalisés) (3 pts)**  
  - **Directives Angular prédéfinies** : `*ngIf`, `*ngFor`, `[ngClass]` dans `project-card.html`, `cv-upload.html`, `add-project.html`, `template-editor.html`, etc.  
  - **Nouvelles directives de contrôle de flux Angular** : `@if`, `@for` utilisées dans `skills-section.html` et d’autres composants.  
  - **Pipe personnalisés** (dans `shared/pipes`) :  
    - `TruncatePipe` : tronquer les descriptions longues.  
    - `StatusColorPipe` : retourner des classes Tailwind en fonction du statut d’un projet.  
    - `TechListPipe` : concaténer un tableau de technos.  
    - `ImageFallbackPipe` : fallback d’image via `ImageUrlService`.  
  - **Directive personnalisée** : `HighlightOnHoverDirective` (`shared/directives/highlight-on-hover.directive.ts`), utilisée sur `project-card.html` avec l’attribut `appHighlightOnHover` pour ajouter un effet de survol custom.

- **Composants Angular (Minimum 4 composants) (4 pts)**  
  - Exemples (il y en a bien plus de 4) :  
    - `Profile`, `ProfileSidebarComponent`, `PersonalInfoForm`, `SkillsSection`, `SocialMediaSection` (feature profile).  
    - `Projects`, `ProjectCard`, `AddProject`, `EditeProject`, `ProjectsGrid`, `ProjectsHeader` (feature project).  
    - `TemplatesPage`, `TemplateEditor` (feature template).  
    - `CvUploadComponent`, `PortfolioViewerComponent`.  
  - Tous sont des **standalone components** (`standalone: true`) avec `imports` explicites.

- **Composants imbriqués (3 pts)**  
  - `Profile` contient : `ProfileSidebarComponent` + `PersonalInfoForm` + `SkillsSection` + `SocialMediaSection`.  
  - `Projects` contient : `ProfileSidebarComponent` + `ProjectsHeader` + `ProjectsGrid` (qui lui-même utilise `ProjectCard`).  
  - `PortfolioViewerComponent` réutilise également `ProfileSidebarComponent`.  
  - Tu peux expliquer le passage de données via `@Input` / `@Output` (`ProjectCard` émet des événements `edit` / `delete`).

- **Services Angular partagés entre composants (5 pts)**  
  - `UserService` partagé entre : `Profile`, `ProfileSidebarComponent`, `PersonalInfoForm`, `SkillsSection`, `SocialMediaSection`, `CvUploadComponent`, `PortfolioViewerComponent`, `TemplatesPage`, `TemplateEditor`, `Projects`, etc.  
  - `ProjectService` partagé entre : `Projects`, `AddProject`, `EditeProject`, `ProjectService` lui-même, `CvUploadComponent`, `PortfolioViewerComponent`, `TemplateEditor`, `TemplatesPage`.  
  - `TemplateService`, `PortfolioService`, `CvParserService`, `AuthService`, `ApiService`, `SocialLinksService` : centralisation de la logique métier et des appels HTTP.  
  - Pour l’oral : bien expliquer le rôle des services (`@Injectable({ providedIn: 'root' })`) et pourquoi on ne met pas la logique HTTP dans les composants.

- **Formulaires + validation (5 pts)**  
  - **Formulaire réactif complet** dans `CvUploadComponent` (`FormGroup`, `FormArray`, `Validators`) avec :  
    - Infos perso : `full_name`, `email`, `phone`, `address`, `linkedin`, `github`.  
    - Profil : `title`, `summary`.  
    - `experiences`, `educations`, `languages`, `projects` comme `FormArray` (méthodes `addExperience`, `addEducation`, etc.).  
    - Validations : `Validators.required`, `Validators.email`, `Validators.minLength(3)` avec messages d’erreur dans `cv-upload.html`.  
  - **Formulaire template-driven** simple dans certains composants (ex : `SkillsSection` avec `[(ngModel)]="newSkill"`).  
  - Pour l’oral : être capable d’expliquer la différence **template-driven vs reactive forms**, la gestion des erreurs (`f['email'].touched && f['email'].invalid`), et pourquoi les `FormArray` sont utiles ici.

- **Routing (3 pts)**  
  - Déclaration centralisée dans `app.routes.ts` : routes vers `profile`, `projects`, `templates`, `templates/:id`, `cv-upload`, `portfolio`, `portfolio/:id` et redirection par défaut vers `profile`.  
  - Utilisation de `RouterModule` et de `routerLink` dans la sidebar (`ProfileSidebarComponent`) pour la navigation.  
  - `app.html` utilise `<router-outlet></router-outlet>` comme point d’entrée de toutes les pages.  
  - Tu peux expliquer le fonctionnement d’une route paramétrée (`templates/:id`, `portfolio/:id`) et la différence entre navigation déclarative (`routerLink`) et impérative (`Router.navigate`).

- **Services HTTP (Json server ou autre similaire) (3 pts)**  
  - Utilisation d’`HttpClient` dans plusieurs services :  
    - `UserService`, `ProjectService`, `TemplateService`, `PortfolioService`, `CvParserService`, `AuthService`, `ApiService`, `SocialLinksService`.  
  - Les services parlent avec un **backend FastAPI** (au lieu de JSON server) via les URLs définies dans `shared/config/api.config.ts`.  
  - Exemples : `ProjectService.createProject`, `UserService.updateUserProfile`, `CvParserService.parseCv`, `CvParserService.parseCvExternal`, `CvParserService.parseCvOllama`.  
  - Pour l’oral : insister sur l’utilisation d’`Observable`, `subscribe`, la gestion d’erreurs (`catchError`) et pourquoi on isole les appels HTTP dans les services.

- **Réponses aux questions de cours et du code (5 pts)**  
  Prépare-toi à pouvoir expliquer :  
  - Différence **composant / service / module** (même si ici on est en standalone components).  
  - Différence **template-driven forms / reactive forms** et pourquoi tu as choisi les reactive forms pour `cv-upload`.  
  - Rôle des **pipes** et des **directives** (structurales `*ngIf`, `*ngFor`, attributives comme `appHighlightOnHover`).  
  - Principe du **routing** Angular et des routes paramétrées.  
  - Pourquoi utiliser des **services partagés** au lieu de dupliquer la logique dans les composants.  
  - Comment fonctionne la **communication parent/enfant** avec `@Input` / `@Output` (ex : `ProjectCard` → `Projects`).  
  - Comment Tailwind est intégré et utilisé pour le design.

### Questions typiques que le professeur peut poser

- **Composants / structure**
  - Explique la structure de ton projet (features, shared, services, core/models).  
  - Donne un exemple de composant imbriqué et explique le passage de données.

- **Routing**
  - Comment as-tu défini la route `/projects` ?  
  - Comment récupèrerais-tu l’`id` dans une route comme `/templates/:id` ?

- **Formulaires**
  - Pourquoi as-tu utilisé un `FormArray` dans `CvUploadComponent` ?  
  - Comment Angular sait qu’un champ est invalide ?  
  - Différence entre `[(ngModel)]` et `formControlName`.

- **Services & HTTP**
  - À quoi sert `UserService` ? Dans quels composants est-il utilisé ?  
  - Comment gères-tu les erreurs HTTP dans `CvUploadComponent.save()` ?  
  - Pourquoi on utilise `forkJoin` pour sauvegarder le profil + les projets ?

- **Directives & pipes**
  - Différence entre une directive structurelle et une directive d’attribut.  
  - Explique le rôle de `StatusColorPipe` et comment il est utilisé dans `project-card.html`.  
  - À quoi sert la directive `appHighlightOnHover` ?

- **Design / Tailwind**
  - Pourquoi as-tu choisi Tailwind ?  
  - Comment as-tu assuré une IHM cohérente entre `profile`, `projects` et `portfolio` ?

Ce README te sert de fiche de révision rapide : ouvre les fichiers mentionnés pendant ta préparation et entraîne-toi à expliquer chaque point à voix haute.
