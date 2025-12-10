import { Pipe, PipeTransform, inject } from '@angular/core';
import { ImageUrlService } from '../services/image-url.service';

@Pipe({ standalone: true, name: 'imageFallback' })
export class ImageFallbackPipe implements PipeTransform {
    private imageUrlService = inject(ImageUrlService);

    transform(value?: string | null, fallback: string = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDYwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMwMCIgeT0iMTIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjI0IiBmb250LWZhbWlseT0iQXJpYWwiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='): string {
        const url = this.imageUrlService.getImageUrl(value);
        return url || fallback;
    }
}
