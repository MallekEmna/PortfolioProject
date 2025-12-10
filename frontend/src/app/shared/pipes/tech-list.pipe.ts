import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'techList' })
export class TechListPipe implements PipeTransform {
    transform(value?: string[] | null, joinWith = ', '): string {
        if (!value || !Array.isArray(value) || value.length === 0) return '';
        return value.join(joinWith);
    }
}
