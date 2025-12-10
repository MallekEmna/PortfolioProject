import { Injectable } from '@angular/core';
import { ApiUrlBuilder } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  /**
   * Construit l'URL complète pour une image
   * @param imagePath - Nom du fichier de l'image ou data URI ou URL complète
   * @returns URL complète de l'image
   */
  getImageUrl(imagePath?: string | null): string {
    const url = ApiUrlBuilder.imageUrl(imagePath || undefined);
    return url || '';
  }

  /**
   * Vérifie si une URL est valide et accessible
   * @param url - URL de l'image à vérifier
   * @returns Promise<boolean> - true si l'image est accessible
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && (response.headers.get('content-type')?.startsWith('image/') ?? false);
    } catch {
      return false;
    }
  }
}
