import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideIconsModule } from '../../../../icons';
import { User } from '../../../../core/models/user.model';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { PortfolioService } from '../../../../services/portfolio.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, LucideIconsModule, RouterModule],
  templateUrl: './profile-sidebar.html',
  styleUrls: ['./profile-sidebar.scss'],
})
export class ProfileSidebarComponent implements OnChanges, OnInit {

  @Input() user!: User | null;
  imageError = false;
  private imageUrl: string = '';
  private lastImageName: string = '';
  portfolioId: string | null = null;

  constructor(
    private userService: UserService,
    private portfolioService: PortfolioService,
    private router: Router
  ) {}

  ngOnInit() {
    // Charger le portfolio de l'utilisateur
    this.loadUserPortfolio();
  }

  // Détecter les changements d'utilisateur pour réinitialiser l'URL
  ngOnChanges() {
    if (this.user?.profileImage !== this.lastImageName) {
      this.lastImageName = this.user?.profileImage || '';
      this.imageUrl = ''; // Réinitialiser pour générer une nouvelle URL
      this.imageError = false;
    }
    
    // Recharger le portfolio si l'utilisateur change
    if (this.user) {
      this.loadUserPortfolio();
    }
  }

  loadUserPortfolio() {
    this.portfolioService.getUserPortfolios({ limit: 1 }).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.portfolioId = response.data[0]._id;
        } else {
          this.portfolioId = null;
        }
      },
      error: (error) => {
        console.error('Error loading portfolio:', error);
        this.portfolioId = null;
      }
    });
  }

  navigateToPortfolio() {
    if (this.portfolioId) {
      this.router.navigate(['/portfolio', this.portfolioId]);
    } else {
      // Si pas de portfolio, rediriger vers les templates pour en créer un
      this.router.navigate(['/templates']);
    }
  }

  get profileImageUrl(): string {
    const imageName = this.user?.profileImage;
    if (!imageName) {
      return 'https://i.pravatar.cc/150'; // URL par défaut directe
    }
    
    // Si c'est déjà une URL complète, la retourner directement
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // Générer une URL stable qui ne change pas à chaque appel
    if (!this.imageUrl || this.imageError) {
      const timestamp = Date.now();
      this.imageUrl = `http://localhost:5000/uploads/${imageName}?t=${timestamp}`;
    }
    
    return this.imageUrl;
  }

  handleImageError(event: any) {
    console.error('Image load error:', event);
    this.imageError = true;
    
    // Solution de fallback robuste
    if (event.target) {
      event.target.src = 'https://i.pravatar.cc/150';
      event.target.onerror = null;
    }
  }

  imageLoadedSuccessfully() {
    this.imageError = false;
  }

}
