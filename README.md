# 📚 Portfolio CV - Application Angular

Application Angular moderne (standalone components) pour gérer un profil, des projets, des templates de portfolio et l'upload de CV avec parsing via un backend FastAPI.

---

## 🚀 Démarrage rapide

```bash
cd frontend
npm install
ng serve
```

Puis ouvrir `http://localhost:4200/`.

---

## 📖 Table des matières

1. [Fondamentaux d'Angular](#fondamentaux-dangular)
2. [Architecture du projet](#architecture-du-projet)
3. [Notions clés expliquées](#notions-clés-expliquées)
4. [Exemples de code du projet](#exemples-de-code-du-projet)
5. [Mapping avec le barème](#mapping-avec-le-barème)
6. [Questions typiques](#questions-typiques)

---

## 🎯 Fondamentaux d'Angular

### Qu'est-ce qu'Angular ?

Angular est un framework JavaScript/TypeScript développé par Google pour créer des applications web dynamiques (SPA - Single Page Applications). Il suit le pattern **MVC** (Model-View-Controller) et utilise le concept de **composants** comme unité de base.

### Concepts fondamentaux

#### 1. **Composants (Components)**

Un composant Angular est une classe TypeScript associée à un template HTML et des styles. Il représente une partie de l'interface utilisateur.

**Exemple dans le projet : `ProjectCard`**

```typescript
// project-card.ts
@Component({
  selector: 'app-project-card',  // Nom du composant dans le HTML
  standalone: true,              // Composant standalone (Angular 17+)
  imports: [                     // Imports nécessaires
    CommonModule,
    StatusColorPipe,
    HighlightOnHoverDirective
  ],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.scss'],
})
export class ProjectCard {
  @Input() project!: Project;           // Données reçues du parent
  @Output() edit = new EventEmitter();  // Événement envoyé au parent
}
```

**Utilisation dans le template :**
```html
<!-- projects-grid.html -->
<app-project-card 
  [project]="project"           <!-- Passage de données -->
  (edit)="onEdit($event)"       <!-- Écoute d'événement -->
  (delete)="onDelete($event)">
</app-project-card>
```

#### 2. **Services**

Les services contiennent la logique métier et les appels HTTP. Ils sont injectables et partagés entre composants.

**Exemple : `UserService`**

```typescript
@Injectable({ providedIn: 'root' })  // Service singleton global
export class UserService {
  private baseUrl = 'http://localhost:5000/api/users';
  private user = signal<User | null>(null);  // Signal pour l'état réactif

  constructor(private http: HttpClient) {}  // Injection de dépendance

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.publicUserId}`);
  }

  // Méthode pour obtenir le signal (état réactif)
  getUserSignal() {
    return this.user;
  }
}
```

**Utilisation dans un composant :**
```typescript
constructor(private userService: UserService) {}

ngOnInit() {
  this.userService.getUserProfile().subscribe({
    next: (response) => {
      // Traiter la réponse
    },
    error: (error) => {
      // Gérer l'erreur
    }
  });
}
```

#### 3. **Signals (Angular 17+)**

Les signals sont une nouvelle API réactive pour gérer l'état. Plus simple et performant que les Observables pour certains cas.

**Exemple :**
```typescript
// Déclaration
isDarkMode = signal<boolean>(false);

// Lecture
if (this.isDarkMode()) { ... }

// Modification
this.isDarkMode.set(true);
this.isDarkMode.update(mode => !mode);

// Computed (dérivé d'autres signals)
currentUser = computed(() => this.userService.getUserSignal()());
```

#### 4. **Directives**

Les directives modifient le comportement ou l'apparence d'un élément DOM.

**Directives structurelles (modifient la structure DOM) :**
- `*ngIf` : Affiche/masque un élément
- `*ngFor` : Répète un élément pour chaque élément d'un tableau
- `@if`, `@for` : Nouvelles syntaxes (Angular 17+)

**Exemple :**
```html
<!-- Ancienne syntaxe -->
<div *ngIf="isLoading">Chargement...</div>
<div *ngFor="let project of projects">{{ project.title }}</div>

<!-- Nouvelle syntaxe (Angular 17+) -->
@if (isLoading()) {
  <div>Chargement...</div>
}

@for (project of projects(); track project._id) {
  <div>{{ project.title }}</div>
}
```

**Directives d'attribut (modifient l'apparence/comportement) :**
```typescript
// highlight-on-hover.directive.ts
@Directive({
  selector: '[appHighlightOnHover]'
})
export class HighlightOnHoverDirective {
  @HostListener('mouseenter')
  onMouseEnter() {
    // Ajouter un effet au survol
  }
}
```

**Utilisation :**
```html
<div appHighlightOnHover>Mon contenu</div>
```

#### 5. **Pipes**

Les pipes transforment les données dans les templates.

**Pipes prédéfinis :**
- `{{ date | date }}` : Formate une date
- `{{ text | uppercase }}` : Met en majuscules
- `{{ items | slice:0:5 }}` : Prend les 5 premiers éléments

**Pipes personnalisés :**
```typescript
// status-color.pipe.ts
@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const colors = {
      'Active': 'bg-green-500',
      'Complete': 'bg-blue-500',
      'Pending': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  }
}
```

**Utilisation :**
```html
<span [class]="project.status | statusColor">
  {{ project.status }}
</span>
```

#### 6. **Formulaires réactifs**

Les formulaires réactifs utilisent `FormGroup`, `FormControl`, et `FormArray` pour gérer les formulaires de manière programmatique.

**Exemple : `CvUploadComponent`**

```typescript
form!: FormGroup;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    experiences: this.fb.array([]),  // Tableau dynamique
    projects: this.fb.array([])
  });
}

// Getter pour accéder au FormArray
get experiences(): FormArray {
  return this.form.get('experiences') as FormArray;
}

// Ajouter une expérience
addExperience() {
  const experienceGroup = this.fb.group({
    company: [''],
    role: [''],
    start_date: ['']
  });
  this.experiences.push(experienceGroup);
}
```

**Template :**
```html
<form [formGroup]="form">
  <input formControlName="full_name" />
  <div *ngIf="form.get('full_name')?.invalid && form.get('full_name')?.touched">
    Le nom est requis
  </div>

  <div formArrayName="experiences">
    <div *ngFor="let exp of experiences.controls; let i = index" [formGroupName]="i">
      <input formControlName="company" />
    </div>
  </div>
</form>
```

#### 7. **Routing (Navigation)**

Le routing permet de naviguer entre les pages sans recharger l'application.

**Configuration : `app.routes.ts`**
```typescript
export const routes: Routes = [
  { path: 'profile', component: Profile },
  { path: 'projects', component: Projects },
  { path: 'templates/:id', component: TemplateEditor },  // Route paramétrée
  { path: 'portfolio/:id', component: PortfolioViewerComponent },
  { path: '', redirectTo: 'profile', pathMatch: 'full' }
];
```

**Navigation déclarative (dans le template) :**
```html
<a routerLink="/projects">Mes projets</a>
<a [routerLink]="['/templates', template._id]">Éditer</a>
```

**Navigation impérative (dans le code) :**
```typescript
constructor(private router: Router) {}

goToProjects() {
  this.router.navigate(['/projects']);
}

// Avec paramètres
editTemplate(id: string) {
  this.router.navigate(['/templates', id]);
}

// Récupérer les paramètres de route
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    const id = params['id'];  // Récupère l'ID de la route
  });
}
```

#### 8. **HTTP Client**

`HttpClient` permet de faire des appels HTTP (GET, POST, PUT, DELETE).

**Exemple dans un service :**
```typescript
constructor(private http: HttpClient) {}

// GET
getProjects(): Observable<Project[]> {
  return this.http.get<Project[]>(`${this.baseUrl}/projects`);
}

// POST
createProject(project: Project): Observable<Project> {
  return this.http.post<Project>(`${this.baseUrl}/projects`, project);
}

// PUT
updateProject(id: string, project: Project): Observable<Project> {
  return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, project);
}

// DELETE
deleteProject(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
}
```

**Utilisation avec gestion d'erreurs :**
```typescript
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

this.projectService.getProjects().pipe(
  catchError(error => {
    console.error('Erreur:', error);
    return of([]);  // Retourner une valeur par défaut
  })
).subscribe(projects => {
  this.projects = projects;
});
```

#### 9. **Communication Parent-Enfant**

**Parent → Enfant : `@Input`**
```typescript
// Enfant (ProjectCard)
@Input() project!: Project;

// Parent (ProjectsGrid)
<app-project-card [project]="project"></app-project-card>
```

**Enfant → Parent : `@Output`**
```typescript
// Enfant (ProjectCard)
@Output() edit = new EventEmitter<Project>();

onEdit() {
  this.edit.emit(this.project);
}

// Parent (ProjectsGrid)
<app-project-card (edit)="onEdit($event)"></app-project-card>

onEdit(project: Project) {
  // Traiter l'événement
}
```

#### 10. **Lifecycle Hooks**

Les hooks du cycle de vie permettent d'exécuter du code à des moments précis.

```typescript
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit() {
    // Exécuté après la création du composant
    // Idéal pour charger des données
  }

  ngOnDestroy() {
    // Exécuté avant la destruction du composant
    // Idéal pour nettoyer (unsubscribe, etc.)
  }
}
```

---

## 🏗️ Architecture du projet

### Structure des dossiers

```
frontend/src/app/
├── core/
│   └── models/          # Modèles TypeScript (User, Project, etc.)
├── features/           # Modules fonctionnels
│   ├── profile/        # Gestion du profil
│   ├── project/        # Gestion des projets
│   ├── template/       # Gestion des templates
│   ├── portfolio/      # Affichage du portfolio
│   └── cv-upload/      # Upload et parsing de CV
├── services/           # Services partagés
│   ├── user.service.ts
│   ├── project.service.ts
│   └── ...
├── shared/            # Composants/pipes/directives partagés
│   ├── pipes/
│   ├── directives/
│   └── config/
└── app.routes.ts      # Configuration du routing
```

### Pattern utilisé : Feature-based architecture

Chaque feature contient ses propres composants, services spécifiques, et logique métier. Les services partagés sont dans `/services`.

**Avantages :**
- ✅ Séparation claire des responsabilités
- ✅ Facilite la maintenance
- ✅ Réutilisabilité des composants

---

## 🔑 Notions clés expliquées

### 1. Standalone Components (Angular 17+)

Les composants standalone n'ont plus besoin d'être déclarés dans un module. Ils importent directement leurs dépendances.

**Avant (avec modules) :**
```typescript
// app.module.ts
@NgModule({
  declarations: [ProjectCard],
  imports: [CommonModule]
})
```

**Maintenant (standalone) :**
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, StatusColorPipe]
})
export class ProjectCard { }
```

### 2. Dependency Injection (Injection de dépendances)

Angular injecte automatiquement les dépendances via le constructeur.

```typescript
constructor(
  private userService: UserService,      // Injection
  private http: HttpClient,              // Injection
  private router: Router                 // Injection
) {}
```

Angular crée une instance unique (singleton) de chaque service grâce à `providedIn: 'root'`.

### 3. Observables vs Signals

**Observables (RxJS)** : Pour les opérations asynchrones (HTTP, événements)
```typescript
this.userService.getUserProfile().subscribe(user => {
  this.user = user;
});
```

**Signals** : Pour l'état réactif simple
```typescript
user = signal<User | null>(null);
user.set(newUser);  // Mise à jour automatique de la vue
```

### 4. Template-driven vs Reactive Forms

**Template-driven** : Simple, déclaratif
```html
<input [(ngModel)]="username" required />
```

**Reactive** : Plus de contrôle, validation programmatique
```typescript
form = this.fb.group({
  username: ['', Validators.required]
});
```

**Quand utiliser quoi ?**
- Template-driven : Formulaires simples
- Reactive : Formulaires complexes avec validation dynamique (comme dans `CvUploadComponent`)

### 5. Change Detection

Angular détecte automatiquement les changements et met à jour la vue. Avec les signals, la détection est encore plus optimisée.

---

## 💻 Exemples de code du projet

### Exemple 1 : Composant avec Input/Output

**`project-card.ts`**
```typescript
@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, StatusColorPipe, HighlightOnHoverDirective],
  templateUrl: './project-card.html'
})
export class ProjectCard {
  @Input() project!: Project;              // Reçoit les données
  @Output() edit = new EventEmitter<Project>();    // Émet un événement
  @Output() delete = new EventEmitter<string>();

  onEdit() {
    this.edit.emit(this.project);
  }

  onDelete() {
    this.delete.emit(this.project._id);
  }
}
```

### Exemple 2 : Service avec HTTP et Signals

**`user.service.ts`**
```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private user = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/${this.publicUserId}`).pipe(
      tap(response => {
        this.user.set(response.data);  // Mise à jour du signal
      })
    );
  }

  getUserSignal() {
    return this.user;  // Retourne le signal pour lecture
  }
}
```

### Exemple 3 : Formulaire réactif avec FormArray

**`cv-upload.ts`**
```typescript
form = this.fb.group({
  full_name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  experiences: this.fb.array([]),  // Tableau dynamique
  projects: this.fb.array([])
});

get experiences(): FormArray {
  return this.form.get('experiences') as FormArray;
}

addExperience() {
  const expGroup = this.fb.group({
    company: [''],
    role: [''],
    start_date: ['']
  });
  this.experiences.push(expGroup);
}

removeExperience(index: number) {
  this.experiences.removeAt(index);
}
```

### Exemple 4 : Routing avec paramètres

**`portfolio-viewer.ts`**
```typescript
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    const param = params['id'];
    // Détecter si c'est un ID MongoDB ou un slug
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(param);
    
    if (isMongoId) {
      this.portfolioId = param;
      this.loadPortfolio();
    } else {
      this.publicUrl = param;
      this.isPublicView.set(true);
      this.loadPortfolioByUrl();
    }
  });
}
```

### Exemple 5 : Pipe personnalisé

**`status-color.pipe.ts`**
```typescript
@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const colors: { [key: string]: string } = {
      'Active': 'bg-green-500 text-white',
      'Complete': 'bg-blue-500 text-white',
      'Pending': 'bg-yellow-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  }
}
```

**Utilisation :**
```html
<span [class]="project.status | statusColor">
  {{ project.status }}
</span>
```

### Exemple 6 : Directive personnalisée

**`highlight-on-hover.directive.ts`**
```typescript
@Directive({
  selector: '[appHighlightOnHover]',
  standalone: true
})
export class HighlightOnHoverDirective {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', 
      '0 20px 25px -5px rgba(79, 70, 229, 0.25)');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'none');
  }
}
```

---

## 📊 Mapping avec le barème du projet Angular

### Test des fonctionnalités implémentées (4 pts)

**Écrans principaux :**
- ✅ `profile` : Gestion des infos perso, skills et réseaux sociaux
- ✅ `projects` : CRUD projets avec cartes et grille
- ✅ `templates` : Choix et édition de template
- ✅ `cv-upload` : Upload de CV PDF, parsing et remplissage auto
- ✅ `portfolio` : Affichage du portfolio généré

**Comment tester :**
1. Naviguer avec la sidebar ou directement via l'URL
2. Créer/éditer/supprimer un projet
3. Modifier les infos perso/skills/réseaux sociaux
4. Uploader un PDF dans CV Upload, parser et sauvegarder
5. Générer/régénérer le portfolio

### Clarté de code (2 pts)

- ✅ Organisation en **features** (`features/profile`, `features/project`, etc.)
- ✅ Services partagés (`UserService`, `ProjectService`, etc.)
- ✅ Utilisation de **signals/computed** pour l'état
- ✅ Nommage explicite des composants et méthodes

### Design (Tailwind + IHM) (3 pts)

- ✅ Tailwind activé avec `darkMode: 'class'`
- ✅ Layout cohérent avec sidebar fixe
- ✅ Cartes avec ombres et animations
- ✅ Badges de statut colorés
- ✅ Responsive design

### Directives et pipes (3 pts)

**Directives prédéfinies :**
- ✅ `*ngIf`, `*ngFor`, `[ngClass]`
- ✅ `@if`, `@for` (nouvelles syntaxes)

**Pipes personnalisés :**
- ✅ `TruncatePipe` : Tronquer les descriptions
- ✅ `StatusColorPipe` : Classes Tailwind selon le statut
- ✅ `TechListPipe` : Concaténer les technos
- ✅ `ImageFallbackPipe` : Fallback d'image

**Directive personnalisée :**
- ✅ `HighlightOnHoverDirective` : Effet au survol

### Composants Angular (4 pts)

**Exemples (bien plus de 4) :**
- ✅ `Profile`, `ProfileSidebarComponent`, `PersonalInfoForm`
- ✅ `Projects`, `ProjectCard`, `AddProject`, `EditeProject`
- ✅ `TemplatesPage`, `TemplateEditor`
- ✅ `CvUploadComponent`, `PortfolioViewerComponent`

Tous sont des **standalone components**.

### Composants imbriqués (3 pts)

- ✅ `Profile` contient : `ProfileSidebarComponent` + `PersonalInfoForm` + `SkillsSection`
- ✅ `Projects` contient : `ProfileSidebarComponent` + `ProjectsHeader` + `ProjectsGrid` (qui utilise `ProjectCard`)
- ✅ Communication via `@Input` / `@Output`

### Services Angular partagés (5 pts)

- ✅ `UserService` : Partagé entre `Profile`, `ProfileSidebarComponent`, `CvUploadComponent`, etc.
- ✅ `ProjectService` : Partagé entre `Projects`, `AddProject`, `CvUploadComponent`, etc.
- ✅ `TemplateService`, `PortfolioService`, `CvParserService`
- ✅ Tous avec `@Injectable({ providedIn: 'root' })`

### Formulaires + validation (5 pts)

- ✅ **Formulaire réactif complet** dans `CvUploadComponent`
  - `FormGroup`, `FormArray`, `Validators`
  - Validations : `required`, `email`, `minLength`
  - Messages d'erreur dans le template
- ✅ **Formulaire template-driven** dans `SkillsSection` avec `[(ngModel)]`

### Routing (3 pts)

- ✅ Routes déclarées dans `app.routes.ts`
- ✅ Routes paramétrées : `templates/:id`, `portfolio/:id`
- ✅ Navigation déclarative (`routerLink`) et impérative (`Router.navigate`)
- ✅ `<router-outlet>` dans `app.html`

### Services HTTP (3 pts)

- ✅ Utilisation d'`HttpClient` dans les services
- ✅ Communication avec backend FastAPI
- ✅ Gestion d'erreurs avec `catchError`
- ✅ Utilisation d'`Observable` et `subscribe`

### Réponses aux questions (5 pts)

Prépare-toi à expliquer :
- ✅ Différence composant / service / module
- ✅ Template-driven vs reactive forms
- ✅ Rôle des pipes et directives
- ✅ Principe du routing
- ✅ Communication parent/enfant
- ✅ Intégration de Tailwind

---

## ❓ Questions typiques

### Composants / Structure

**Q : Explique la structure de ton projet.**

**R :** Le projet suit une architecture **feature-based** :
- `features/` : Chaque feature (profile, project, etc.) contient ses composants
- `services/` : Services partagés pour la logique métier et HTTP
- `shared/` : Pipes, directives, config partagés
- `core/models/` : Modèles TypeScript

**Q : Donne un exemple de composant imbriqué.**

**R :** `Projects` contient `ProjectsGrid`, qui contient `ProjectCard`. Communication via `@Input` pour passer les données et `@Output` pour les événements.

### Routing

**Q : Comment récupérer l'ID dans `/templates/:id` ?**

**R :**
```typescript
constructor(private route: ActivatedRoute) {}

ngOnInit() {
  this.route.params.subscribe(params => {
    const id = params['id'];
  });
}
```

### Formulaires

**Q : Pourquoi utiliser `FormArray` dans `CvUploadComponent` ?**

**R :** Pour gérer dynamiquement plusieurs expériences, formations, langues, projets. On peut ajouter/supprimer des éléments à la volée.

**Q : Différence entre `[(ngModel)]` et `formControlName` ?**

**R :**
- `[(ngModel)]` : Template-driven, bidirectionnel, simple
- `formControlName` : Reactive forms, plus de contrôle, validation programmatique

### Services & HTTP

**Q : À quoi sert `UserService` ?**

**R :** Centralise la logique de gestion de l'utilisateur : récupération du profil, mise à jour, upload d'image, gestion des skills. Utilisé par plusieurs composants.

**Q : Comment gérer les erreurs HTTP ?**

**R :**
```typescript
this.userService.getUserProfile().pipe(
  catchError(error => {
    console.error('Erreur:', error);
    return of(null);  // Valeur par défaut
  })
).subscribe(user => {
  // Traiter la réponse
});
```

### Directives & Pipes

**Q : Différence directive structurelle vs attribut ?**

**R :**
- **Structurelle** (`*ngIf`, `*ngFor`) : Modifie la structure DOM (ajoute/supprime des éléments)
- **Attribut** (`appHighlightOnHover`) : Modifie l'apparence/comportement d'un élément existant

**Q : Explique `StatusColorPipe`.**

**R :** Transforme un statut (string) en classes Tailwind CSS pour le style. Utilisé dans `project-card.html` pour colorer les badges de statut.

### Design / Tailwind

**Q : Pourquoi Tailwind ?**

**R :** Framework CSS utilitaire qui permet de styliser rapidement sans écrire de CSS custom. Classes utilitaires comme `bg-blue-500`, `rounded-xl`, `shadow-lg`.

**Q : Comment assurer une IHM cohérente ?**

**R :** 
- Sidebar fixe réutilisée (`ProfileSidebarComponent`)
- Classes Tailwind cohérentes
- Composants réutilisables (`ProjectCard`, etc.)
- Design system avec couleurs et espacements constants

---

## 🎓 Ressources pour approfondir

- [Documentation officielle Angular](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)
- [Routing](https://angular.dev/guide/router)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📝 Notes importantes

- Ce projet utilise **Angular 17+** avec **standalone components**
- Les **signals** sont utilisés pour l'état réactif
- Le backend est en **FastAPI** (Python)
- Le design utilise **Tailwind CSS** avec support du dark mode

---

**Bon courage pour votre présentation ! 🚀**
