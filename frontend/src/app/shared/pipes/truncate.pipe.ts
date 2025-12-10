import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: true, name: 'truncate' })
export class TruncatePipe implements PipeTransform {
    transform(value: string | null | undefined, max = 120): string {
        if (!value) return '';
        if (value.length <= max) return value;
        return value.slice(0, max).trimEnd() + '…';
    }
}
